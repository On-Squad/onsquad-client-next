import { afterEach, describe, expect, it } from 'vitest';

// buildReport 는 공개 API(index.ts)로 내보내지 않은 내부 순수 계산 함수다.
// observeStartup 은 PerformanceObserver/paint 타이밍에 의존해 jsdom 으로 재현이 어려워,
// 소스에서 buildReport 만 export 로 열어 순수 계산 로직을 직접 검증한다.
import { buildReport } from '@/shared/lib/observability/startup';
import type { AppInfo } from '@/shared/lib/observability';

afterEach(() => {
  delete window.__ONSQUAD_APP__;
});

const makeNav = (fields: Partial<Record<keyof PerformanceNavigationTiming, unknown>>) =>
  fields as unknown as PerformanceNavigationTiming;

describe('buildReport', () => {
  it('tapAt/webviewCreatedAt 이 주입된 웹뷰에서는 detail 에 네이티브 구간이 포함된다', () => {
    const origin = performance.timeOrigin;
    const app: AppInfo = {
      bridgeVersion: 1,
      appVersion: '1.0.0',
      os: 'ios',
      methods: [],
      tapAt: origin - 1_000,
      webviewCreatedAt: origin - 400,
    };
    window.__ONSQUAD_APP__ = app;

    const nav = makeNav({ requestStart: 50, responseStart: 340 });
    const report = buildReport(nav, 500);

    expect(report.detail).toEqual({
      ttfb: 290,
      render: 160,
      nativeToWebview: 600,
      webviewToRequest: 450,
    });
  });

  it('주입이 없는 브라우저에서는 ttfb/render 만 있고 네이티브 구간 키가 없다', () => {
    const nav = makeNav({ requestStart: 50, responseStart: 340 });
    const report = buildReport(nav, 500);

    expect(report.detail).toEqual({
      ttfb: 290,
      render: 160,
    });
  });
});
