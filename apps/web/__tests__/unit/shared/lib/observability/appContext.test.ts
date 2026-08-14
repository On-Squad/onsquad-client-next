import { afterEach, describe, expect, it } from 'vitest';

import { getRuntimeContext } from '@/shared/lib/observability';
import type { AppInfo } from '@/shared/lib/observability';

afterEach(() => {
  delete window.__ONSQUAD_APP__;
  delete window.ReactNativeWebView;
});

const injectWebviewApp = (app: AppInfo) => {
  window.ReactNativeWebView = { postMessage: () => {} };
  window.__ONSQUAD_APP__ = app;
};

describe('getRuntimeContext', () => {
  it('웹뷰가 앱 정보를 주입하면 os/앱버전/브릿지버전이 주입값 그대로 태깅된다', () => {
    injectWebviewApp({
      bridgeVersion: 3,
      appVersion: '1.2.0',
      os: 'android',
      tapAt: 1_000,
      webviewCreatedAt: 1_200,
    });

    const context = getRuntimeContext();

    expect(context.isWebView).toBe(true);
    expect(context.os).toBe('android');
    expect(context.appVersion).toBe('1.2.0');
    expect(context.bridgeVersion).toBe(3);
  });

  it('일반 브라우저에서는 웹으로 태깅되고 앱 버전 정보가 비어 있다', () => {
    const context = getRuntimeContext();

    expect(context.isWebView).toBe(false);
    expect(context.os).toBe('web');
    expect(context.appVersion).toBeNull();
    expect(context.bridgeVersion).toBeNull();
  });

  it('구버전 앱처럼 웹뷰 신호만 있고 앱 정보 주입이 없으면 브라우저와 같은 기본값으로 떨어진다', () => {
    window.ReactNativeWebView = { postMessage: () => {} };

    const context = getRuntimeContext();

    expect(context.isWebView).toBe(true);
    expect(context.os).toBe('web');
    expect(context.appVersion).toBeNull();
    expect(context.bridgeVersion).toBeNull();
  });
});
