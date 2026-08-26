import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { apiFetch } from '../../../src/shared/api/common';
import type { ResponseModel } from '../../../src/shared/api/model';
import { setMutationErrorPresenter } from '../../../src/shared/lib/queries/mutationErrorPresenter';
import { useApiMutation } from '../../../src/shared/lib/queries/useApiMutation';
import { server } from '../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

/** 재시도가 켜져 있으면 에러 케이스가 기다리다 타임아웃 난다. */
const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

describe('변경 요청의 실패와 성공을 사용자에게 알리는 방식', () => {
  let shownMessages: string[];

  beforeEach(() => {
    shownMessages = [];
    setMutationErrorPresenter(error => shownMessages.push(error.message));
  });

  it('서버가 봉투에 error 를 담아 거절하면 그 사유가 사용자에게 전달된다', async () => {
    server.use(
      http.post(`${BASE}/crews/1/requests`, () =>
        HttpResponse.json({
          status: 200,
          success: false,
          error: { code: 'CRM002', message: '이미 신청한 크루예요.' },
        }),
      ),
    );

    const { result } = renderHook(
      () => useApiMutation({ fetcher: () => apiFetch.post<ResponseModel>('/crews/1/requests') }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(shownMessages).toHaveLength(1));
    expect(shownMessages[0]).toBe('이미 신청한 크루예요.');
  });

  it('토큰이 만료되어 실패하면 중앙 처리에 맡기고 따로 알리지 않는다', async () => {
    server.use(
      http.post(`${BASE}/crews/1/requests`, () =>
        HttpResponse.json({
          status: 200,
          success: false,
          error: { code: 'T003', message: '토큰이 만료되었습니다.' },
        }),
      ),
    );

    const { result } = renderHook(
      () => useApiMutation({ fetcher: () => apiFetch.post<ResponseModel>('/crews/1/requests') }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(shownMessages).toEqual([]);
  });

  it('요청이 성공하면 사용자가 보고 있던 화면이 다시 조회된다', async () => {
    let detailRequestCount = 0;

    server.use(
      http.get(`${BASE}/crews/1`, () => {
        detailRequestCount += 1;

        return HttpResponse.json({ status: 200, success: true, data: { id: 1 } });
      }),
      http.post(`${BASE}/crews/1/requests`, () => HttpResponse.json({ status: 200, success: true })),
    );

    // `invalidateQueries` 는 **구독자가 있는 쿼리만** 다시 부른다.
    // 캐시에만 넣어두면 재요청이 일어나지 않는다 — 화면이 열려 있는 상황을 만들어야 한다.
    const { result } = renderHook(
      () => ({
        detail: useQuery({ queryKey: ['crew', 'detail', 1], queryFn: () => apiFetch.get<ResponseModel>('/crews/1') }),
        request: useApiMutation({
          fetcher: () => apiFetch.post<ResponseModel>('/crews/1/requests'),
          invalidateKeys: [['crew', 'detail', 1]],
        }),
      }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(detailRequestCount).toBe(1));

    result.current.request.mutate(undefined);

    await waitFor(() => expect(detailRequestCount).toBe(2));
  });
});
