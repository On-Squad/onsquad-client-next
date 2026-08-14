import { getAppInfo, getRuntimeContext } from './appContext';
import { emit } from './sink';
import type { MetricReport } from './types';

const METRIC_NAME = 'startup';
const FCP = 'first-contentful-paint';

/**
 * 웹뷰에서 "0초"는 요청 시점이 아니라 **사용자가 탭한 순간**이다.
 * 브라우저에 없던 두 구간(앱 라우팅, 웹뷰 생성)이 앞에 통째로 붙기 때문에,
 * Lighthouse 점수가 좋아도 체감은 느릴 수 있다.
 *
 * 그래서 구간을 나눠 재고 책임을 가른다.
 *
 * | 구간             | 책임        |
 * | ---------------- | ----------- |
 * | nativeToWebview  | 앱          |
 * | webviewToRequest | 앱 + 네트워크 |
 * | ttfb             | 서버 · CDN  |
 * | render           | 웹 (우리)   |
 *
 * 앞 두 구간은 RN 이 주입한 epoch 타임스탬프가 있어야 계산된다.
 * RN 과 WebView 는 같은 기기 시계를 쓰므로 `Date.now()` 값끼리 직접 빼도 된다.
 */
const buildDetail = (nav: PerformanceNavigationTiming, fcpAt: number) => {
  const app = getAppInfo();
  const toEpoch = (relative: number) => performance.timeOrigin + relative;

  const detail: Record<string, number> = {
    ttfb: Math.round(nav.responseStart - nav.requestStart),
    render: Math.round(fcpAt - nav.responseStart),
  };

  if (app?.tapAt && app.webviewCreatedAt) {
    detail.nativeToWebview = Math.round(app.webviewCreatedAt - app.tapAt);
    detail.webviewToRequest = Math.round(toEpoch(nav.requestStart) - app.webviewCreatedAt);
  }

  return detail;
};

/** 순수 계산이라 단위테스트에서 직접 부른다 — jsdom 은 PerformanceObserver/paint 타이밍을 흉내낼 수 없어 observeStartup 자체는 검증이 어렵다. */
export const buildReport = (nav: PerformanceNavigationTiming, fcpAt: number): MetricReport => {
  const app = getAppInfo();
  const fcpEpoch = performance.timeOrigin + fcpAt;
  // 앱이 탭 시각을 안 줬으면(브라우저·구버전 앱) 문서 시작을 0초로 삼는다.
  const zero = app?.tapAt ?? performance.timeOrigin;

  return {
    kind: 'metric',
    name: METRIC_NAME,
    durationMs: Math.round(fcpEpoch - zero),
    detail: buildDetail(nav, fcpAt),
    context: getRuntimeContext(),
    at: Date.now(),
  };
};

const getNavigationEntry = () => performance.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined;

const getFcp = () => performance.getEntriesByName?.(FCP)[0]?.startTime;

/**
 * FCP 가 찍히는 시점에 시작 성능을 한 번 기록한다.
 *
 * @returns 해제 함수
 */
export const observeStartup = () => {
  const nav = getNavigationEntry();

  if (!nav) {
    return () => {};
  }

  const alreadyPainted = getFcp();

  if (alreadyPainted !== undefined) {
    emit(buildReport(nav, alreadyPainted));

    return () => {};
  }

  if (typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  const observer = new PerformanceObserver((list) => {
    const entry = list.getEntries().find(({ name }) => name === FCP);

    if (!entry) {
      return;
    }

    emit(buildReport(nav, entry.startTime));
    observer.disconnect();
  });

  observer.observe({ type: 'paint', buffered: true });

  return () => observer.disconnect();
};
