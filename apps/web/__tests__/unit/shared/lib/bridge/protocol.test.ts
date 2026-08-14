import { describe, expect, it } from 'vitest';

import { isResponseEnvelope, parseNativeMessage } from '@onsquad/bridge';
import type { BridgeEventEnvelope, BridgeResponseEnvelope } from '@onsquad/bridge';

describe('parseNativeMessage', () => {
  it('JSON 파싱에 실패한 문자열은 무시된다 (null)', () => {
    expect(parseNativeMessage('{ 이건 JSON 이 아니다')).toBeNull();
  });

  it('배열로 온 메시지는 무시된다 (null)', () => {
    expect(parseNativeMessage('[]')).toBeNull();
  });

  it('null 리터럴로 온 메시지는 무시된다 (null)', () => {
    expect(parseNativeMessage('null')).toBeNull();
  });

  it('id 도 event 도 없는 객체는 무시된다 (null)', () => {
    expect(parseNativeMessage(JSON.stringify({ v: 1, foo: 'bar' }))).toBeNull();
  });

  it('id 가 있는 응답 봉투는 그대로 파싱된다', () => {
    const raw = JSON.stringify({ v: 1, id: 'req-1', res: { ok: true } });

    expect(parseNativeMessage(raw)).toEqual({ v: 1, id: 'req-1', res: { ok: true } });
  });

  it('event 가 있는 이벤트 봉투는 그대로 파싱된다', () => {
    const raw = JSON.stringify({ v: 1, event: 'tab.reselect', payload: { tab: 'home' } });

    expect(parseNativeMessage(raw)).toEqual({ v: 1, event: 'tab.reselect', payload: { tab: 'home' } });
  });
});

describe('isResponseEnvelope', () => {
  it('id 를 가진 봉투는 응답으로 판정한다', () => {
    const response: BridgeResponseEnvelope = { v: 1, id: 'req-1', res: undefined };

    expect(isResponseEnvelope(response)).toBe(true);
  });

  it('id 없이 event 만 가진 봉투는 응답이 아니라고 판정한다', () => {
    const event: BridgeEventEnvelope = { v: 1, event: 'app.background' };

    expect(isResponseEnvelope(event)).toBe(false);
  });
});
