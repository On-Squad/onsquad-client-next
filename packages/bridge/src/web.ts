/**
 * 웹 쪽 브릿지 SDK.
 *
 * **플랫폼을 아는 파일은 여기 하나다.** 사용처는 `await call('share.url', {...})` 만 보면 된다.
 * 앱이 호출 방식을 바꿔도 고칠 파일은 이 하나여야 한다.
 */
import {
  BRIDGE_VERSION,
  DEFAULT_TIMEOUT_MS,
  METHOD_TIMEOUT_MS,
  type AppInfo,
  type BridgeMethod,
  type BridgeRequest,
  type BridgeResponse,
  type NativeEventName,
  type NativeEventPayload,
} from './contract';
import { BridgeError } from './errors';
import { BRIDGE_ERROR_CODES, isResponseEnvelope, parseNativeMessage, type BridgeRequestEnvelope } from './protocol';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    __ONSQUAD_APP__?: AppInfo;
    /** 네이티브 → 웹의 **유일한** 진입점. 이름을 바꾸면 구버전 앱이 부르던 함수가 사라진다. */
    __onNative?: (raw: string) => void;
  }
}

interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: BridgeError) => void;
  timer: ReturnType<typeof setTimeout>;
}

const pending = new Map<string, Pending>();
const listeners = new Map<string, Set<(payload: unknown) => void>>();

let sequence = 0;

/** crypto.randomUUID 는 보안 컨텍스트에서만 있다. 없어도 동작해야 하므로 카운터로 떨어진다. */
const nextId = (): string => {
  sequence += 1;

  return globalThis.crypto?.randomUUID?.() ?? `b-${Date.now()}-${sequence}`;
};

const getApp = (): AppInfo | undefined => (typeof window === 'undefined' ? undefined : window.__ONSQUAD_APP__);

/** 웹뷰 판정은 UA 가 아니라 이 전역의 존재 여부로 한다. UA 는 앱 설정에 따라 바뀐다. */
export const isWebView = (): boolean => typeof window !== 'undefined' && Boolean(window.ReactNativeWebView);

export const getAppInfo = (): AppInfo | undefined => getApp();

/**
 * 지금 이 앱이 그 메서드를 지원하는가.
 *
 * **새 기능은 반드시 이 뒤에 숨긴다.** 웹만 먼저 배포되면 구버전 앱에서 전부 실패한다.
 */
export const can = (method: BridgeMethod): boolean => getApp()?.methods.includes(method) ?? false;

const settle = (id: string, apply: (p: Pending) => void) => {
  const p = pending.get(id);

  if (!p) {
    return;
  }

  clearTimeout(p.timer);
  pending.delete(id);
  apply(p);
};

/**
 * 네이티브를 부르고 답을 기다린다.
 *
 * 요청마다 번호표(id)를 붙이고, 같은 번호표로 돌아온 응답에 Promise 를 잇는다.
 * **타임아웃이 핵심이다** — 네이티브가 크래시하거나 그 메서드를 모르면 답이 영원히 안 온다.
 */
export const call = <M extends BridgeMethod>(
  method: M,
  req: BridgeRequest<M>,
  timeoutMs: number = METHOD_TIMEOUT_MS[method] ?? DEFAULT_TIMEOUT_MS,
): Promise<BridgeResponse<M>> =>
  new Promise<BridgeResponse<M>>((resolve, reject) => {
    const post = typeof window === 'undefined' ? undefined : window.ReactNativeWebView?.postMessage;

    if (!post) {
      reject(new BridgeError(BRIDGE_ERROR_CODES.UNSUPPORTED_METHOD, method, '브릿지가 없는 환경입니다.'));

      return;
    }

    const id = nextId();
    const timer = setTimeout(() => {
      settle(id, (p) => p.reject(new BridgeError(BRIDGE_ERROR_CODES.TIMEOUT, method)));
    }, timeoutMs);

    pending.set(id, {
      resolve: resolve as (value: unknown) => void,
      reject,
      timer,
    });

    const envelope: BridgeRequestEnvelope = { v: BRIDGE_VERSION, id, method, req };

    // postMessage 가 던지면 pending 이 타임아웃까지 남는다. 즉시 정리한다.
    try {
      window.ReactNativeWebView?.postMessage(JSON.stringify(envelope));
    } catch (error) {
      settle(id, (p) =>
        p.reject(new BridgeError(BRIDGE_ERROR_CODES.INTERNAL, method, (error as Error)?.message)),
      );
    }
  });

/** 네이티브 이벤트를 구독한다. @returns 해제 함수 */
export const on = <E extends NativeEventName>(event: E, handler: (payload: NativeEventPayload<E>) => void) => {
  const set = listeners.get(event) ?? new Set();
  const wrapped = handler as (payload: unknown) => void;

  set.add(wrapped);
  listeners.set(event, set);

  return () => {
    set.delete(wrapped);
  };
};

/**
 * 네이티브 → 웹의 유일한 입구를 연다. 앱 부팅 시 한 번만 호출한다.
 *
 * @returns 해제 함수
 */
export const install = () => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.__onNative = (raw: string) => {
    const message = parseNativeMessage(raw);

    if (!message) {
      return;
    }

    if (isResponseEnvelope(message)) {
      settle(message.id, (p) => {
        if (message.error) {
          p.reject(new BridgeError(message.error.code, '', message.error.message));

          return;
        }

        p.resolve(message.res);
      });

      return;
    }

    listeners.get(message.event)?.forEach((handler) => handler(message.payload));
  };

  return () => {
    delete window.__onNative;
  };
};

/** 테스트용 — 모듈 스코프에 남은 대기/구독을 비운다. */
export const __resetForTest = () => {
  pending.forEach((p) => clearTimeout(p.timer));
  pending.clear();
  listeners.clear();
};
