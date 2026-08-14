import { afterEach, describe, expect, it, vi } from 'vitest';

import { BRIDGE_VERSION, BridgeError } from '@onsquad/bridge';
import type { BridgeRequestEnvelope, BridgeResponseEnvelope } from '@onsquad/bridge';
import { __resetForTest, call, can, install, on } from '@onsquad/bridge/web';

// web.ts 는 pending 요청/이벤트 리스너를 모듈 스코프에 들고 있고, window 전역도 직접 건드린다.
// 케이스 사이에 새는 상태가 없도록 매번 전부 원복한다.
afterEach(() => {
  delete window.ReactNativeWebView;
  delete window.__ONSQUAD_APP__;
  delete window.__onNative;
  __resetForTest();
  vi.useRealTimers();
  vi.clearAllMocks();
});

/** window.__onNative 로 네이티브 응답/이벤트를 흉내낸다. */
const sendFromNative = (envelope: BridgeResponseEnvelope | { v: number; event: string; payload?: unknown }) => {
  window.__onNative?.(JSON.stringify(envelope));
};

describe('call', () => {
  it('요청 시 method 와 req 를 담은 봉투를 postMessage 로 전송한다', () => {
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };

    // 응답을 흉내내지 않으므로 이 호출은 영영 pending 이다 — afterEach 의 __resetForTest 가 타이머를 정리한다.
    call('share.url', { url: 'https://onsquad.app', title: '온스쿼드' });

    expect(postMessage).toHaveBeenCalledTimes(1);
    const envelope = JSON.parse(postMessage.mock.calls[0][0] as string) as BridgeRequestEnvelope;

    expect(envelope.v).toBe(BRIDGE_VERSION);
    expect(envelope.method).toBe('share.url');
    expect(envelope.req).toEqual({ url: 'https://onsquad.app', title: '온스쿼드' });
  });

  it('같은 id 로 응답이 오면 그 res 값으로 resolve 된다', async () => {
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };
    install();

    const promise = call('push.getToken', undefined);
    const envelope = JSON.parse(postMessage.mock.calls[0][0] as string) as BridgeRequestEnvelope;

    sendFromNative({ v: BRIDGE_VERSION, id: envelope.id, res: { token: 'abc123' } });

    await expect(promise).resolves.toEqual({ token: 'abc123' });
  });

  it('error 봉투가 오면 BridgeError 로 reject 되고 code 가 보존된다', async () => {
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };
    install();

    const promise = call('media.pickImage', { max: 1 });
    const envelope = JSON.parse(postMessage.mock.calls[0][0] as string) as BridgeRequestEnvelope;

    sendFromNative({ v: BRIDGE_VERSION, id: envelope.id, error: { code: 'PERMISSION_DENIED', message: '거부됨' } });

    await expect(promise).rejects.toBeInstanceOf(BridgeError);
    await expect(promise).rejects.toMatchObject({ code: 'PERMISSION_DENIED' });
  });

  it('모르는 id 로 온 응답은 무시되고, 요청은 올바른 id 응답이 올 때까지 계속 대기한다', async () => {
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };
    install();

    let settled = false;
    const promise = call('push.getToken', undefined).finally(() => {
      settled = true;
    });

    sendFromNative({ v: BRIDGE_VERSION, id: 'unrelated-id', res: { token: 'wrong' } });
    await Promise.resolve();
    expect(settled).toBe(false);

    const envelope = JSON.parse(postMessage.mock.calls[0][0] as string) as BridgeRequestEnvelope;
    sendFromNative({ v: BRIDGE_VERSION, id: envelope.id, res: { token: 'right' } });

    await expect(promise).resolves.toEqual({ token: 'right' });
  });

  it('__onNative 에 깨진 JSON 이나 봉투가 아닌 문자열이 들어와도 예외를 던지지 않는다', () => {
    install();

    expect(() => window.__onNative?.('{ 이건 JSON 이 아니다')).not.toThrow();
    expect(() => window.__onNative?.(JSON.stringify('그냥 문자열'))).not.toThrow();
  });

  it('응답이 오지 않으면 지정한 시간 뒤 TIMEOUT 코드로 reject 된다', async () => {
    vi.useFakeTimers();
    window.ReactNativeWebView = { postMessage: vi.fn() };

    const promise = call('push.getToken', undefined, 5_000);
    const assertion = expect(promise).rejects.toMatchObject({ code: 'TIMEOUT' });

    await vi.advanceTimersByTimeAsync(5_000);
    await assertion;
  });

  it('타임아웃된 뒤 뒤늦게 응답이 와도 아무 일도 일어나지 않는다', async () => {
    vi.useFakeTimers();
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };
    install();

    const promise = call('push.getToken', undefined, 5_000);
    const envelope = JSON.parse(postMessage.mock.calls[0][0] as string) as BridgeRequestEnvelope;
    // rejects 핸들러를 타이머 진행 전에 붙여야 한다 — advanceTimersByTimeAsync 는 매크로태스크를
    // 경유하므로, reject 가 먼저 발생하고 핸들러를 뒤늦게 붙이면 unhandled rejection 경고가 뜬다.
    const assertion = expect(promise).rejects.toMatchObject({ code: 'TIMEOUT' });

    await vi.advanceTimersByTimeAsync(5_000);
    await assertion;

    expect(() => sendFromNative({ v: BRIDGE_VERSION, id: envelope.id, res: { token: 'late' } })).not.toThrow();
  });

  it('네이티브 브릿지가 없는 브라우저 환경에서는 UNSUPPORTED_METHOD 로 reject 된다', async () => {
    await expect(call('shell.close', undefined)).rejects.toMatchObject({ code: 'UNSUPPORTED_METHOD' });
  });
});

describe('can', () => {
  it('앱이 주입한 methods 목록에 있는 메서드는 true 를 반환한다', () => {
    window.__ONSQUAD_APP__ = {
      bridgeVersion: 1,
      appVersion: '1.0.0',
      os: 'ios',
      methods: ['shell.ready'],
    };

    expect(can('shell.ready')).toBe(true);
  });

  it('앱이 주입한 methods 목록에 없는 메서드는 false 를 반환한다', () => {
    window.__ONSQUAD_APP__ = {
      bridgeVersion: 1,
      appVersion: '1.0.0',
      os: 'ios',
      methods: ['shell.ready'],
    };

    expect(can('shell.close')).toBe(false);
  });

  it('앱 정보 주입 자체가 없으면(일반 브라우저) false 를 반환한다', () => {
    expect(can('shell.ready')).toBe(false);
  });
});

describe('on', () => {
  it('구독한 이벤트를 받고, 해제 함수 호출 후에는 더 이상 받지 못한다', () => {
    install();
    const handler = vi.fn();
    const off = on('tab.reselect', handler);

    sendFromNative({ v: BRIDGE_VERSION, event: 'tab.reselect', payload: { tab: 'home' } });
    expect(handler).toHaveBeenCalledWith({ tab: 'home' });

    off();
    sendFromNative({ v: BRIDGE_VERSION, event: 'tab.reselect', payload: { tab: 'home' } });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('install', () => {
  it('반환한 해제 함수를 호출하면 window.__onNative 가 사라진다', () => {
    const uninstall = install();
    expect(window.__onNative).toBeDefined();

    uninstall();
    expect(window.__onNative).toBeUndefined();
  });
});
