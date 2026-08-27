import { afterEach, describe, expect, it, vi } from 'vitest';

// shell.ts 의 계약은 "can() 결과에 따라 봉투 요청과 레거시 평문 신호 중 무엇을 보내는가" 다.
// call/can 자체의 postMessage·타임아웃 동작은 web.test.ts 에서 이미 실물로 검증하므로,
// 여기서는 그 경계를 mock 해 분기 자체만 본다 (vi.mock 사용 근거: 순수 함수 export 라 spyOn 대상이 없다).
vi.mock('@onsquad/bridge/web', () => ({
  call: vi.fn().mockResolvedValue(undefined),
  can: vi.fn(),
}));

import { call, can } from '@onsquad/bridge/web';

import { setBackGesture, shellPush, shellReplace, shellReady } from '@/shared/lib/bridge/shell';

afterEach(() => {
  delete window.ReactNativeWebView;
  vi.clearAllMocks();
});

describe('shellReady', () => {
  it('shell.ready 를 모르는 구버전 앱에서는 평문 APP_READY 신호를 보낸다', () => {
    vi.mocked(can).mockReturnValue(false);
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };

    shellReady();

    expect(postMessage).toHaveBeenCalledWith('APP_READY');
    expect(call).not.toHaveBeenCalled();
  });

  it('shell.ready 를 지원하는 앱에서는 평문 대신 브릿지 봉투로 요청한다', () => {
    vi.mocked(can).mockReturnValue(true);
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };

    shellReady();

    expect(call).toHaveBeenCalledWith('shell.ready', undefined);
    expect(postMessage).not.toHaveBeenCalled();
  });
});

describe('setBackGesture', () => {
  it('구버전 앱에서 true 로 호출하면 평문 NATIVE_BACK:on 신호를 보낸다', () => {
    vi.mocked(can).mockReturnValue(false);
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };

    setBackGesture(true);

    expect(postMessage).toHaveBeenCalledWith('NATIVE_BACK:on');
    expect(call).not.toHaveBeenCalled();
  });

  it('구버전 앱에서 false 로 호출하면 평문 NATIVE_BACK:off 신호를 보낸다', () => {
    vi.mocked(can).mockReturnValue(false);
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };

    setBackGesture(false);

    expect(postMessage).toHaveBeenCalledWith('NATIVE_BACK:off');
    expect(call).not.toHaveBeenCalled();
  });

  it('shell.setBackGesture 를 지원하는 앱에서는 평문 대신 { enabled } 봉투로 요청한다', () => {
    vi.mocked(can).mockReturnValue(true);
    const postMessage = vi.fn();
    window.ReactNativeWebView = { postMessage };

    setBackGesture(true);

    expect(call).toHaveBeenCalledWith('shell.setBackGesture', { enabled: true });
    expect(postMessage).not.toHaveBeenCalled();
  });
});

describe('shellPush', () => {
  it('공지 상세 경로를 shell.push 브릿지 요청으로 전달한다', () => {
    shellPush('/crews/1/announce/5');

    expect(call).toHaveBeenCalledWith('shell.push', { path: '/crews/1/announce/5' });
  });

  it('공지 작성 경로를 shell.push 브릿지 요청으로 전달한다', () => {
    shellPush('/crews/1/announce/write');

    expect(call).toHaveBeenCalledWith('shell.push', { path: '/crews/1/announce/write' });
  });
});

describe('shellReplace', () => {
  it('공지 상세 경로를 shell.replace 브릿지 요청으로 전달한다', () => {
    shellReplace('/crews/1/announce/5');

    expect(call).toHaveBeenCalledWith('shell.replace', { path: '/crews/1/announce/5' });
  });

  it('공지 목록 경로를 shell.replace 브릿지 요청으로 전달한다 — 작성 완료 후 목록으로 돌아갈 때 쓴다', () => {
    shellReplace('/crews/1/announce');

    expect(call).toHaveBeenCalledWith('shell.replace', { path: '/crews/1/announce' });
  });
});
