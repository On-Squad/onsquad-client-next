import { beforeEach, describe, expect, it, vi } from 'vitest';

// timeoutNotifier.ts 의 등록 함수는 모듈 스코프 상태라 케이스 순서가 결과에 영향을 준다.
// 매 케이스마다 모듈을 새로 로드해 상태를 초기화한다.
beforeEach(() => {
  vi.resetModules();
});

describe('notifyRequestTimeout', () => {
  it('등록한 알림 함수가 타임아웃 알림 요청을 그대로 전달받는다', async () => {
    const { setTimeoutNotifier, notifyRequestTimeout } = await import('@/shared/api/timeoutNotifier');
    let calledCount = 0;
    setTimeoutNotifier(() => {
      calledCount += 1;
    });

    notifyRequestTimeout();

    expect(calledCount).toBe(1);
  });

  it('알림 함수를 등록하기 전에 알려도 아무 일도 일어나지 않는다', async () => {
    const { notifyRequestTimeout } = await import('@/shared/api/timeoutNotifier');

    expect(() => notifyRequestTimeout()).not.toThrow();
  });

  it('알림 함수가 예외를 던져도 호출부로 전파되지 않는다', async () => {
    const { setTimeoutNotifier, notifyRequestTimeout } = await import('@/shared/api/timeoutNotifier');
    let wasCalled = false;
    setTimeoutNotifier(() => {
      wasCalled = true;
      throw new Error('notifier 내부 오류');
    });

    expect(() => notifyRequestTimeout()).not.toThrow();
    expect(wasCalled).toBe(true);
  });
});
