import { afterEach, describe, expect, it } from 'vitest';

import { captureError, installGlobalErrorHandlers, setSink } from '@/shared/lib/observability';
import type { ErrorReport, Sink } from '@/shared/lib/observability';

let uninstall: (() => void) | undefined;

afterEach(() => {
  uninstall?.();
  uninstall = undefined;
});

const captureSink = () => {
  const received: ErrorReport[] = [];
  const sink: Sink = {
    send: (report) => {
      if (report.kind === 'error') {
        received.push(report);
      }
    },
  };

  return { sink, received };
};

describe('installGlobalErrorHandlers', () => {
  it('window 의 error 이벤트가 source=onerror 로 태깅되어 수집된다', () => {
    const { sink, received } = captureSink();
    setSink(sink);
    uninstall = installGlobalErrorHandlers();

    window.dispatchEvent(new ErrorEvent('error', { error: new Error('boom') }));

    expect(received).toHaveLength(1);
    expect(received[0].source).toBe('onerror');
    expect(received[0].message).toBe('boom');
  });

  it('unhandledrejection 이 source=unhandledrejection 으로 태깅되어 수집된다', () => {
    const { sink, received } = captureSink();
    setSink(sink);
    uninstall = installGlobalErrorHandlers();

    const event = new Event('unhandledrejection', { cancelable: true }) as PromiseRejectionEvent;
    Object.defineProperty(event, 'reason', { value: new Error('rejected') });
    window.dispatchEvent(event);

    expect(received).toHaveLength(1);
    expect(received[0].source).toBe('unhandledrejection');
    expect(received[0].message).toBe('rejected');
  });

  it('반환된 해제 함수를 호출하면 이후 발생한 에러는 더 이상 수집되지 않는다', () => {
    const { sink, received } = captureSink();
    setSink(sink);
    const dispose = installGlobalErrorHandlers();
    dispose();

    // 해제 후에는 우리 리스너가 없어 jsdom 이 이 dispatch 를 "아무도 못 받은 에러"로 보고
    // 콘솔에 진짜 uncaught exception 으로 에스컬레이션한다. 여기서 검증하려는 건
    // 그 에스컬레이션이 아니라 captureError 로 이어지지 않는다는 것이므로, 임시 리스너로
    // preventDefault 해서 jsdom 기본 동작만 막는다.
    const suppressJsdomEscalation = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener('error', suppressJsdomEscalation);
    window.dispatchEvent(new ErrorEvent('error', { error: new Error('해제 이후 에러') }));
    window.removeEventListener('error', suppressJsdomEscalation);

    expect(received).toHaveLength(0);
  });
});

describe('captureError', () => {
  it('Error 인스턴스가 아닌 값을 넘기면 UnknownError 로 정규화된다', () => {
    const { sink, received } = captureSink();
    setSink(sink);

    captureError('그냥 문자열 에러');

    expect(received).toHaveLength(1);
    expect(received[0].name).toBe('UnknownError');
    expect(received[0].message).toBe('그냥 문자열 에러');
  });
});
