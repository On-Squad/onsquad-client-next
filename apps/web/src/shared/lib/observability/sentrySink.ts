import * as Sentry from '@sentry/nextjs';

import type { Sink } from './types';

/**
 * 관측 리포트를 Sentry 로 흘려보낸다.
 *
 * 중복 전송 주의 — Sentry SDK 는 `window.onerror` 와 `unhandledrejection` 을 **자체적으로** 잡는다.
 * 우리 전역 핸들러(`installGlobalErrorHandlers`)가 잡은 것까지 여기서 다시 보내면 같은 에러가 두 번 올라간다.
 * 그래서 자동 수집 대상은 건너뛰고, 코드에서 명시적으로 부른 `captureError` 만 전달한다.
 * (우리 핸들러는 디버그 오버레이용 링 버퍼를 채우는 역할로 남는다)
 */
export const sentrySink: Sink = {
  send: (report) => {
    if (report.kind === 'metric') {
      // 이슈가 아니라 로그로 보낸다 — 시작 성능은 "고장"이 아니라 추세로 봐야 하는 값이다.
      Sentry.logger.info(report.name, { durationMs: report.durationMs, ...report.detail });

      return;
    }

    if (report.source !== 'manual') {
      return;
    }

    Sentry.captureException(report.error ?? new Error(report.message));
  },
};
