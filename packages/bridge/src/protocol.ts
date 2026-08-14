/**
 * 와이어 포맷. 웹과 네이티브가 실제로 주고받는 JSON 모양.
 *
 * 방향이 둘인데 성격은 셋이다.
 *   웹 → 네이티브 : 요청 (id 있음, 답을 기다림)
 *   네이티브 → 웹 : 응답 (같은 id 를 돌려줌)
 *   네이티브 → 웹 : 이벤트 (id 없음, 답 없음)
 *
 * 셋을 한 채널로 흘리므로, 받는 쪽은 `id` 유무로 응답과 이벤트를 가른다.
 */
import { BRIDGE_VERSION } from './contract';

/** 브릿지가 실패하는 방식. 문자열 코드로 두는 이유는 구버전 앱이 보낸 값도 읽혀야 해서다. */
export const BRIDGE_ERROR_CODES = {
  /** 앱이 이 메서드를 모른다. 대개 구버전 앱. fallback 으로 내려가야 한다. */
  UNSUPPORTED_METHOD: 'UNSUPPORTED_METHOD',
  /** 웹이 기다리다 포기했다. 네이티브가 크래시했거나 답을 잃어버린 경우. */
  TIMEOUT: 'TIMEOUT',
  /** OS 권한이 거부됨. */
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  /** 사용자가 취소. **실패가 아니라 정상 흐름이다** — 토스트를 띄우면 안 된다. */
  CANCELLED: 'CANCELLED',
  /** 그 외 네이티브 내부 오류. */
  INTERNAL: 'INTERNAL',
} as const;

export type BridgeErrorCode = (typeof BRIDGE_ERROR_CODES)[keyof typeof BRIDGE_ERROR_CODES];

export interface BridgeErrorPayload {
  code: BridgeErrorCode | string;
  message?: string;
}

/** 웹 → 네이티브 */
export interface BridgeRequestEnvelope {
  v: number;
  id: string;
  method: string;
  req?: unknown;
}

/** 네이티브 → 웹 (요청에 대한 답) */
export interface BridgeResponseEnvelope {
  v: number;
  id: string;
  res?: unknown;
  error?: BridgeErrorPayload;
}

/** 네이티브 → 웹 (일방 통보) */
export interface BridgeEventEnvelope {
  v: number;
  event: string;
  payload?: unknown;
}

export type NativeMessage = BridgeResponseEnvelope | BridgeEventEnvelope;

export const isResponseEnvelope = (message: NativeMessage): message is BridgeResponseEnvelope =>
  typeof (message as BridgeResponseEnvelope).id === 'string';

/**
 * 네이티브가 보낸 문자열을 파싱한다.
 * 남이 보낸 입력이므로 실패를 정상 경로로 취급한다 — 던지지 않고 null 을 준다.
 */
export const parseNativeMessage = (raw: string): NativeMessage | null => {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    const message = parsed as NativeMessage;
    const hasId = typeof (message as BridgeResponseEnvelope).id === 'string';
    const hasEvent = typeof (message as BridgeEventEnvelope).event === 'string';

    return hasId || hasEvent ? message : null;
  } catch {
    return null;
  }
};

/** 웹 → 네이티브 요청과 짝이 맞는 성공 응답을 만든다. (네이티브 쪽에서 사용) */
export const makeResponse = (id: string, res?: unknown): BridgeResponseEnvelope => ({
  v: BRIDGE_VERSION,
  id,
  res,
});

/** 실패 응답을 만든다. (네이티브 쪽에서 사용) */
export const makeErrorResponse = (
  id: string,
  code: BridgeErrorCode | string,
  message?: string,
): BridgeResponseEnvelope => ({
  v: BRIDGE_VERSION,
  id,
  error: { code, message },
});
