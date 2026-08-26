import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { useCancelRequestMutation } from '../../../../src/features/crew/detail/model/useCancelRequestMutation';
import { useCrewRequestMutation } from '../../../../src/features/crew/detail/model/useCrewRequestMutation';
import { apiFetch } from '../../../../src/shared/api/common';
import type { ResponseModel } from '../../../../src/shared/api/model';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

describe('크루 가입 신청', () => {
  it('신청하면 그 크루의 신청 접수 경로로 요청이 나간다', async () => {
    const requested: { method: string; path: string }[] = [];

    server.use(
      http.post(`${BASE}/crews/:crewId/requests`, ({ request }) => {
        requested.push({ method: request.method, path: new URL(request.url).pathname });

        return HttpResponse.json({ status: 200, success: true });
      }),
    );

    const { result } = renderHook(() => useCrewRequestMutation({ crewId: 42 }), {
      wrapper: createWrapper(createQueryClient()),
    });

    result.current.mutate(42);

    await waitFor(() => expect(requested).toHaveLength(1));
    expect(requested[0]).toEqual({ method: 'POST', path: '/api/crews/42/requests' });
  });

  it('신청이 접수되면 보고 있던 크루 상세가 다시 조회되어 신청 상태가 갱신된다', async () => {
    let detailRequestCount = 0;

    server.use(
      http.get(`${BASE}/crews/42`, () => {
        detailRequestCount += 1;

        return HttpResponse.json({
          status: 200,
          success: true,
          data: { id: 42, states: { alreadyRequest: detailRequestCount > 1 } },
        });
      }),
      http.post(`${BASE}/crews/42/requests`, () => HttpResponse.json({ status: 200, success: true })),
    );

    const { result } = renderHook(
      () => ({
        detail: useQuery({
          queryKey: ['crew', 'detail', 42],
          queryFn: () => apiFetch.get<ResponseModel>('/crews/42'),
        }),
        request: useCrewRequestMutation({ crewId: 42 }),
      }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(detailRequestCount).toBe(1));

    result.current.request.mutate(42);

    await waitFor(() => expect(detailRequestCount).toBe(2));
  });
});

describe('크루 가입 신청 취소', () => {
  it('취소하면 그 크루에 낸 내 신청만 지우는 경로로 요청이 나간다', async () => {
    const requested: { method: string; path: string }[] = [];

    server.use(
      http.delete(`${BASE}/crews/:crewId/requests/me`, ({ request }) => {
        requested.push({ method: request.method, path: new URL(request.url).pathname });

        return HttpResponse.json({ status: 200, success: true });
      }),
    );

    const { result } = renderHook(() => useCancelRequestMutation({ crewId: 42 }), {
      wrapper: createWrapper(createQueryClient()),
    });

    result.current.mutate(42);

    await waitFor(() => expect(requested).toHaveLength(1));
    expect(requested[0]).toEqual({ method: 'DELETE', path: '/api/crews/42/requests/me' });
  });

  it('취소가 접수되면 보고 있던 크루 상세가 다시 조회된다', async () => {
    let detailRequestCount = 0;

    server.use(
      http.get(`${BASE}/crews/42`, () => {
        detailRequestCount += 1;

        return HttpResponse.json({ status: 200, success: true, data: { id: 42 } });
      }),
      http.delete(`${BASE}/crews/42/requests/me`, () =>
        HttpResponse.json({ status: 200, success: true }),
      ),
    );

    const { result } = renderHook(
      () => ({
        detail: useQuery({
          queryKey: ['crew', 'detail', 42],
          queryFn: () => apiFetch.get<ResponseModel>('/crews/42'),
        }),
        cancel: useCancelRequestMutation({ crewId: 42 }),
      }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(detailRequestCount).toBe(1));

    result.current.cancel.mutate(42);

    await waitFor(() => expect(detailRequestCount).toBe(2));
  });
});
