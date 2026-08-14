import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ApiResponse } from '@/shared/api/common';
import { ErrorCode, type ResponseModel } from '@/shared/api/model';
import { type MutationErrorPresenter, setMutationErrorPresenter } from '@/shared/lib/queries/mutationErrorPresenter';
import { useApiMutation } from '@/shared/lib/queries/useApiMutation';

import { createWrapper } from '../utils/wrapper';

afterEach(() => {
  // 모듈 스코프 presenter 를 기본값(no-op)으로 되돌려 다음 테스트로 새는 것을 막는다.
  setMutationErrorPresenter(() => {});
});

describe('useApiMutation', () => {
  it('요청이 실패하면 등록해둔 실패 표시 로직이 에러 메시지와 함께 실행된다', async () => {
    const presenter = vi.fn<MutationErrorPresenter>();
    setMutationErrorPresenter(presenter);

    const fetcher = vi.fn(
      async (): Promise<ApiResponse<ResponseModel>> => ({
        data: { success: false, status: 200, error: { code: ErrorCode.CRM001, message: '크루에 속해있지 않습니다.' } },
        headers: new Headers(),
      }),
    );

    const { result } = renderHook(() => useApiMutation<ResponseModel, never[]>({ fetcher }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(presenter).toHaveBeenCalledTimes(1);
    expect(presenter.mock.calls[0][0].message).toBe('크루에 속해있지 않습니다.');
  });

  it('토큰 만료로 실패한 요청은 실패 표시 로직을 거치지 않는다', async () => {
    const presenter = vi.fn<MutationErrorPresenter>();
    setMutationErrorPresenter(presenter);

    const fetcher = vi.fn(
      async (): Promise<ApiResponse<ResponseModel>> => ({
        data: { success: false, status: 200, error: { code: ErrorCode.T003, message: '토큰이 만료되었습니다.' } },
        headers: new Headers(),
      }),
    );

    const { result } = renderHook(() => useApiMutation<ResponseModel, never[]>({ fetcher }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(presenter).not.toHaveBeenCalled();
  });

  it('요청이 성공하면 실패 표시 로직이 실행되지 않는다', async () => {
    const presenter = vi.fn<MutationErrorPresenter>();
    setMutationErrorPresenter(presenter);

    const fetcher = vi.fn(
      async (): Promise<ApiResponse<ResponseModel>> => ({
        data: { success: true, status: 200 },
        headers: new Headers(),
      }),
    );

    const { result } = renderHook(() => useApiMutation<ResponseModel, never[]>({ fetcher }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(presenter).not.toHaveBeenCalled();
  });
});
