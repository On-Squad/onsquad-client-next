import { beforeEach, describe, expect, it, vi } from 'vitest';

// mutationErrorPresenter.ts 의 `present` 는 모듈 스코프 상태라 케이스 순서가 결과에 영향을 준다.
// 매 케이스마다 모듈을 새로 로드해 상태를 초기화한다.
beforeEach(() => {
  vi.resetModules();
});

describe('presentMutationError', () => {
  it('등록한 실패 표시 로직이 알림 요청을 그대로 전달받는다', async () => {
    const { setMutationErrorPresenter, presentMutationError } = await import(
      '@/shared/lib/queries/mutationErrorPresenter'
    );
    const received: Error[] = [];
    setMutationErrorPresenter((error) => {
      received.push(error);
    });

    const error = new Error('크루 신청에 실패했습니다.');
    presentMutationError(error);

    expect(received).toEqual([error]);
  });

  it('실패 표시 로직을 등록하기 전에 알려도 아무 일도 일어나지 않는다', async () => {
    const { presentMutationError } = await import('@/shared/lib/queries/mutationErrorPresenter');

    expect(() => presentMutationError(new Error('아직 아무도 안 듣는 에러'))).not.toThrow();
  });

  it('실패 표시 로직이 알리다 예외를 던져도 원래 에러 흐름이 끊기지 않는다', async () => {
    const { setMutationErrorPresenter, presentMutationError } = await import(
      '@/shared/lib/queries/mutationErrorPresenter'
    );
    let wasCalled = false;
    setMutationErrorPresenter(() => {
      wasCalled = true;
      throw new Error('presenter 내부 오류');
    });

    expect(() => presentMutationError(new Error('원래 에러'))).not.toThrow();
    expect(wasCalled).toBe(true);
  });
});
