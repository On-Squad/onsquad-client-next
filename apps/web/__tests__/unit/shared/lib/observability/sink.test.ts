import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ErrorReport, RuntimeContext, Sink } from '@/shared/lib/observability';

const baseContext: RuntimeContext = {
  isWebView: false,
  os: 'web',
  appVersion: null,
  bridgeVersion: null,
  webVersion: 'dev',
};

const makeErrorReport = (overrides: Partial<ErrorReport> = {}): ErrorReport => ({
  kind: 'error',
  name: 'Error',
  message: 'boom',
  stack: undefined,
  source: 'manual',
  context: baseContext,
  at: Date.now(),
  ...overrides,
});

// sink.ts 의 recent 배열/current sink 는 모듈 스코프 상태라 케이스 순서가 결과에 영향을 준다.
// 매 케이스마다 모듈을 새로 로드해 상태를 초기화한다.
beforeEach(() => {
  vi.resetModules();
});

describe('emit', () => {
  it('등록한 sink 가 예외를 던져도 emit 은 죽지 않는다', async () => {
    const { emit, setSink } = await import('@/shared/lib/observability');
    const throwingSink: Sink = {
      send: () => {
        throw new Error('sink 내부 오류');
      },
    };
    setSink(throwingSink);

    expect(() => emit(makeErrorReport())).not.toThrow();
  });

  it('setSink 로 교체한 sink 가 리포트를 그대로 받는다', async () => {
    const { emit, setSink } = await import('@/shared/lib/observability');
    const received: ErrorReport[] = [];
    const spySink: Sink = {
      send: (report) => received.push(report as ErrorReport),
    };
    setSink(spySink);

    const report = makeErrorReport({ message: '커스텀 sink 도착 확인' });
    emit(report);

    expect(received).toEqual([report]);
  });
});

describe('getRecentReports', () => {
  it('상한(50)을 넘겨 쌓으면 가장 오래된 리포트부터 버려진다', async () => {
    const { emit, getRecentReports, setSink } = await import('@/shared/lib/observability');
    setSink({ send: () => {} }); // 기본 consoleSink 의 로그 출력을 억제

    for (let i = 0; i < 55; i += 1) {
      emit(makeErrorReport({ message: `report-${i}` }));
    }

    const messages = getRecentReports().map((report) => (report.kind === 'error' ? report.message : ''));

    expect(messages).toHaveLength(50);
    expect(messages[0]).toBe('report-5');
    expect(messages[49]).toBe('report-54');
  });
});
