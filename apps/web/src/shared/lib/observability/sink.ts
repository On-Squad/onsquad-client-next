import type { Report, Sink } from './types';

/** 디버그 오버레이가 읽어갈 최근 리포트. 웹뷰엔 F12 가 없어서 화면에 띄우는 것 말곤 방법이 없다. */
const RECENT_LIMIT = 50;
const recent: Report[] = [];

const consoleSink: Sink = {
  send: (report) => {
    if (report.kind === 'error') {
      console.error(`[obs] ${report.name}: ${report.message}`, report);

      return;
    }

    console.info(`[obs] ${report.name} ${report.durationMs}ms`, report.detail ?? {});
  },
};

let current: Sink = consoleSink;

/** Sentry 등 실제 수집처를 붙일 때 호출한다. 붙이기 전까지는 콘솔로 흐른다. */
export const setSink = (sink: Sink) => {
  current = sink;
};

/** 관측이 앱을 죽이면 안 되므로 sink 예외는 삼킨다. */
export const emit = (report: Report) => {
  recent.push(report);

  if (recent.length > RECENT_LIMIT) {
    recent.shift();
  }

  try {
    current.send(report);
  } catch {
    // sink 실패는 무시한다 — 여기서 throw 하면 리포팅이 장애 원인이 된다.
  }
};

export const getRecentReports = (): readonly Report[] => recent;
