/**
 * 네이티브(RN) 쪽 브릿지 헬퍼.
 *
 * WebView 에 직접 의존하지 않는다 — `injectJavaScript` 를 콜백으로 받는다.
 * 그래야 이 패키지가 react-native 를 dependency 로 끌지 않고, 테스트도 쉽다.
 */
import { BRIDGE_VERSION, type AppInfo, type BridgeMethod, type NativeEventName, type NativeEventPayload } from './contract';
import {
  BRIDGE_ERROR_CODES,
  makeErrorResponse,
  makeResponse,
  type BridgeErrorCode,
  type BridgeEventEnvelope,
  type BridgeRequestEnvelope,
  type BridgeResponseEnvelope,
} from './protocol';

/**
 * 이 앱 빌드가 실제로 처리하는 메서드.
 *
 * 웹은 이 목록을 보고 새 기능을 쓸지 fallback 으로 갈지 정한다(`can()`).
 * **핸들러를 구현하기 전에 여기 먼저 넣으면 안 된다** — 웹이 지원한다고 믿고 부르다 타임아웃 난다.
 */
export const SUPPORTED_METHODS: readonly BridgeMethod[] = [
  'shell.ready',
  'shell.setBackGesture',
];

/** 메서드별 처리기. 값을 돌려주면 성공 응답, 던지면 실패 응답이 나간다. */
export type BridgeHandlers = {
  [M in BridgeMethod]?: (req: unknown) => Promise<unknown> | unknown;
};

/** 핸들러에서 특정 실패 코드를 내보내고 싶을 때 던진다. */
export class NativeBridgeError extends Error {
  readonly code: BridgeErrorCode;

  constructor(code: BridgeErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'NativeBridgeError';
    this.code = code;
  }
}

const toScript = (payload: BridgeResponseEnvelope | BridgeEventEnvelope): string =>
  // JSON.stringify 를 두 번 — 바깥쪽이 JS 문자열 리터럴로 안전하게 이스케이프해 준다.
  // (따옴표/개행이 든 메시지가 스크립트를 깨뜨리는 걸 막는다)
  `window.__onNative && window.__onNative(${JSON.stringify(JSON.stringify(payload))}); true;`;

const parseRequest = (raw: string): BridgeRequestEnvelope | null => {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    const envelope = parsed as BridgeRequestEnvelope;

    return typeof envelope.id === 'string' && typeof envelope.method === 'string' ? envelope : null;
  } catch {
    return null;
  }
};

/**
 * 웹이 보낸 메시지 하나를 처리한다.
 *
 * 브릿지 봉투가 아닌 문자열(구버전 웹의 평문 신호 등)은 **처리하지 않고 false** 를 준다.
 * 호출부가 그때 레거시 경로로 넘기면 된다.
 *
 * @returns 이 메시지를 브릿지가 소비했는지
 */
export const handleWebMessage = (
  raw: string,
  handlers: BridgeHandlers,
  injectJavaScript: (script: string) => void,
): boolean => {
  const envelope = parseRequest(raw);

  if (!envelope) {
    return false;
  }

  const { id, method, req } = envelope;
  const handler = handlers[method as BridgeMethod];

  if (!handler) {
    injectJavaScript(toScript(makeErrorResponse(id, BRIDGE_ERROR_CODES.UNSUPPORTED_METHOD, method)));

    return true;
  }

  // 동기 핸들러가 던지는 것까지 잡으려면 Promise 로 감싸야 한다.
  Promise.resolve()
    .then(() => handler(req))
    .then((res) => injectJavaScript(toScript(makeResponse(id, res))))
    .catch((error: unknown) => {
      const code = error instanceof NativeBridgeError ? error.code : BRIDGE_ERROR_CODES.INTERNAL;

      injectJavaScript(toScript(makeErrorResponse(id, code, (error as Error)?.message)));
    });

  return true;
};

/** 네이티브 → 웹 일방 통보. */
export const emitEvent = <E extends NativeEventName>(
  event: E,
  payload: NativeEventPayload<E>,
  injectJavaScript: (script: string) => void,
) => {
  const envelope: BridgeEventEnvelope = { v: BRIDGE_VERSION, event, payload };

  injectJavaScript(toScript(envelope));
};

/**
 * 콘텐츠 로드 전에 주입할 스크립트를 만든다.
 * 웹의 첫 렌더부터 `can()` 과 환경 태깅이 동작하려면 이 시점이어야 한다.
 */
export const buildAppInfoScript = (info: AppInfo): string =>
  `window.__ONSQUAD_APP__ = ${JSON.stringify(info)}; true;`;
