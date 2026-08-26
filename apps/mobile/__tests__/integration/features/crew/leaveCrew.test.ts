import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useLeaveCrewMutation } from '../../../../src/features/crew/detail/model/useLeaveCrewMutation';
import { apiFetch } from '../../../../src/shared/api/common';
import type { ResponseModel } from '../../../../src/shared/api/model';
import { setMutationErrorPresenter } from '../../../../src/shared/lib/queries/mutationErrorPresenter';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

describe('크루 나가기', () => {
  // presenter 는 모듈 전역이라 테스트 사이에 새어나간다.
  // 매번 새로 등록해 파일을 단독으로 돌리든 순서를 바꾸든 같은 결과가 나오게 한다.
  let shownMessages: string[];

  beforeEach(() => {
    shownMessages = [];
    setMutationErrorPresenter(error => shownMessages.push(error.message));
  });

  it('나가면 그 크루에서 내 멤버십만 지우는 경로로 요청이 나간다', async () => {
    const requested: { method: string; path: string }[] = [];

    server.use(
      http.delete(`${BASE}/crews/:crewId/members/me`, ({ request }) => {
        requested.push({ method: request.method, path: new URL(request.url).pathname });

        return HttpResponse.json({ status: 200, success: true });
      }),
    );

    const { result } = renderHook(() => useLeaveCrewMutation({ crewId: 42 }), {
      wrapper: createWrapper(createQueryClient()),
    });

    result.current.mutate(undefined);

    await waitFor(() => expect(requested).toHaveLength(1));
    expect(requested[0]).toEqual({ method: 'DELETE', path: '/api/crews/42/members/me' });
  });

  it('나가기가 접수되면 보고 있던 크루 상세가 다시 조회되어 참여 상태가 갱신된다', async () => {
    let detailRequestCount = 0;

    server.use(
      http.get(`${BASE}/crews/42`, () => {
        detailRequestCount += 1;

        return HttpResponse.json({
          status: 200,
          success: true,
          data: { id: 42, states: { alreadyParticipant: detailRequestCount === 1 } },
        });
      }),
      http.delete(`${BASE}/crews/42/members/me`, () =>
        HttpResponse.json({ status: 200, success: true }),
      ),
    );

    const { result } = renderHook(
      () => ({
        detail: useQuery({
          queryKey: ['crew', 'detail', 42],
          queryFn: () => apiFetch.get<ResponseModel>('/crews/42'),
        }),
        leave: useLeaveCrewMutation({ crewId: 42 }),
      }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(detailRequestCount).toBe(1));

    result.current.leave.mutate(undefined);

    await waitFor(() => expect(detailRequestCount).toBe(2));
  });

  it('서버가 나가기를 거절하면 그 사유가 사용자에게 전달된다', async () => {
    server.use(
      http.delete(`${BASE}/crews/42/members/me`, () =>
        HttpResponse.json({
          status: 200,
          success: false,
          error: { code: 'CRM003', message: '크루장은 크루를 나갈 수 없어요.' },
        }),
      ),
    );

    const { result } = renderHook(() => useLeaveCrewMutation({ crewId: 42 }), {
      wrapper: createWrapper(createQueryClient()),
    });

    result.current.mutate(undefined);

    await waitFor(() => expect(shownMessages).toHaveLength(1));
    expect(shownMessages[0]).toBe('크루장은 크루를 나갈 수 없어요.');
  });
});
