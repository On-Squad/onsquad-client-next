import { describe, expect, it, vi } from 'vitest';

import type { BridgeRequestEnvelope } from '@onsquad/bridge';
import { NativeBridgeError, handleWebMessage } from '@onsquad/bridge/native';
import type { BridgeHandlers } from '@onsquad/bridge/native';

interface DecodedResponse {
  id: string;
  error?: { code: string; message?: string };
}

/**
 * native.ts 의 toScript 가 만드는 `window.__onNative && window.__onNative("..."); true;` 형태에서
 * 실제 응답 payload 를 복원한다. toScript 가 JSON.stringify 를 두 번 감싸므로 여기서도 두 번 판다.
 */
const extractInjectedPayload = (script: string): DecodedResponse => {
  const prefix = 'window.__onNative && window.__onNative(';
  const suffix = '); true;';

  if (!script.startsWith(prefix) || !script.endsWith(suffix)) {
    throw new Error(`예상치 못한 스크립트 형태: ${script}`);
  }

  const literal = script.slice(prefix.length, script.length - suffix.length);
  const stringified = JSON.parse(literal) as string;

  return JSON.parse(stringified) as unknown as DecodedResponse;
};

// SUPPORTED_METHODS 가 BridgeMap 의 키인지는 `readonly BridgeMethod[]` 타입이 컴파일 타임에 강제한다.
// 런타임 테스트로 다시 확인하려면 BridgeMap 키를 손으로 미러링해야 해서, 계약이 늘 때마다 같이 썩는다.

describe('handleWebMessage', () => {
  it.each(['APP_READY', 'NATIVE_BACK:on'])(
    '계약 이전 평문 신호 "%s" 는 처리하지 않고 false 를 반환한다',
    (raw) => {
      const injectJavaScript = vi.fn();

      const consumed = handleWebMessage(raw, {}, injectJavaScript);

      expect(consumed).toBe(false);
      expect(injectJavaScript).not.toHaveBeenCalled();
    },
  );

  it('정상 봉투를 받으면 true 를 반환하고 해당 method 의 핸들러를 호출한다', async () => {
    const injectJavaScript = vi.fn();
    const handler = vi.fn().mockResolvedValue(undefined);
    const handlers: BridgeHandlers = { 'shell.ready': handler };
    const envelope: BridgeRequestEnvelope = { v: 1, id: 'req-1', method: 'shell.ready', req: undefined };

    const consumed = handleWebMessage(JSON.stringify(envelope), handlers, injectJavaScript);

    expect(consumed).toBe(true);
    await vi.waitFor(() => expect(handler).toHaveBeenCalledWith(undefined));
  });

  it('핸들러가 없는 method 는 UNSUPPORTED_METHOD 응답 스크립트를 inject 한다', () => {
    const injectJavaScript = vi.fn();
    const envelope: BridgeRequestEnvelope = { v: 1, id: 'req-2', method: 'shell.close', req: undefined };

    const consumed = handleWebMessage(JSON.stringify(envelope), {}, injectJavaScript);

    expect(consumed).toBe(true);
    expect(injectJavaScript).toHaveBeenCalledTimes(1);
    const payload = extractInjectedPayload(injectJavaScript.mock.calls[0][0] as string);
    expect(payload.id).toBe('req-2');
    expect(payload.error?.code).toBe('UNSUPPORTED_METHOD');
  });

  it('핸들러가 NativeBridgeError 를 던지면 그 error code 로 응답이 나간다', async () => {
    const injectJavaScript = vi.fn();
    const handler = vi.fn().mockImplementation(() => {
      throw new NativeBridgeError('CANCELLED', '사용자가 취소했다');
    });
    const envelope: BridgeRequestEnvelope = { v: 1, id: 'req-3', method: 'shell.ready', req: undefined };

    handleWebMessage(JSON.stringify(envelope), { 'shell.ready': handler }, injectJavaScript);

    await vi.waitFor(() => expect(injectJavaScript).toHaveBeenCalledTimes(1));
    const payload = extractInjectedPayload(injectJavaScript.mock.calls[0][0] as string);
    expect(payload.error?.code).toBe('CANCELLED');
  });

  // 이 케이스는 두 가지를 함께 증명한다:
  // (1) NativeBridgeError 가 아닌 일반 Error 는 INTERNAL 코드로 매핑된다
  // (2) 핸들러가 "동기적으로" 던져도 handleWebMessage 호출 자체는 죽지 않고 에러 응답이 나간다
  //     (native.ts 가 Promise.resolve().then(handler) 로 감싼 이유)
  it('동기 핸들러가 일반 Error 를 던져도 안전하게 INTERNAL 코드로 응답이 나간다', async () => {
    const injectJavaScript = vi.fn();
    const handler = vi.fn().mockImplementation(() => {
      throw new Error('예상 못한 내부 오류');
    });
    const envelope: BridgeRequestEnvelope = { v: 1, id: 'req-4', method: 'shell.ready', req: undefined };

    expect(() => handleWebMessage(JSON.stringify(envelope), { 'shell.ready': handler }, injectJavaScript)).not.toThrow();

    await vi.waitFor(() => expect(injectJavaScript).toHaveBeenCalledTimes(1));
    const payload = extractInjectedPayload(injectJavaScript.mock.calls[0][0] as string);
    expect(payload.error?.code).toBe('INTERNAL');
  });

  it('에러 메시지에 따옴표와 개행이 들어가도 inject 되는 스크립트가 깨지지 않고 원본 메시지가 복원된다', async () => {
    const injectJavaScript = vi.fn();
    const trickyMessage = '메시지에 "따옴표" 와\n개행이 있다';
    const handler = vi.fn().mockImplementation(() => {
      throw new Error(trickyMessage);
    });
    const envelope: BridgeRequestEnvelope = { v: 1, id: 'req-5', method: 'shell.ready', req: undefined };

    handleWebMessage(JSON.stringify(envelope), { 'shell.ready': handler }, injectJavaScript);

    await vi.waitFor(() => expect(injectJavaScript).toHaveBeenCalledTimes(1));
    const payload = extractInjectedPayload(injectJavaScript.mock.calls[0][0] as string);

    expect(payload.id).toBe('req-5');
    expect(payload.error?.message).toBe(trickyMessage);
  });
});
