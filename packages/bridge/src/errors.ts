import { BRIDGE_ERROR_CODES, type BridgeErrorCode } from './protocol';

/** 브릿지 호출 실패. `code` 로 분기한다 — 메시지 문자열로 분기하지 말 것. */
export class BridgeError extends Error {
  readonly code: BridgeErrorCode | string;
  readonly method: string;

  constructor(code: BridgeErrorCode | string, method: string, message?: string) {
    super(message ?? `bridge ${code}: ${method}`);
    this.name = 'BridgeError';
    this.code = code;
    this.method = method;
  }
}

export const isBridgeError = (error: unknown): error is BridgeError => error instanceof BridgeError;

/**
 * 사용자가 취소한 것인지.
 *
 * 피커/공유 취소는 **에러가 아니라 정상 흐름**이다.
 * 이걸 안 가르면 사용자가 취소를 누를 때마다 "실패했어요" 토스트가 뜬다.
 */
export const isCancelled = (error: unknown): boolean =>
  isBridgeError(error) && error.code === BRIDGE_ERROR_CODES.CANCELLED;

/** 앱이 그 메서드를 모르는 것인지. fallback 으로 내려갈지 판단할 때 쓴다. */
export const isUnsupported = (error: unknown): boolean =>
  isBridgeError(error) && error.code === BRIDGE_ERROR_CODES.UNSUPPORTED_METHOD;
