import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { crewQueries } from '../../../../src/entities/crew/api/crew.queries';
import { useAcceptCrewRequestMutation } from '../../../../src/features/crew/manage/participants/model/useAcceptCrewRequestMutation';
import { useRejectCrewRequestMutation } from '../../../../src/features/crew/manage/participants/model/useRejectCrewRequestMutation';
import { setMutationErrorPresenter } from '../../../../src/shared/lib/queries/mutationErrorPresenter';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

/**
 * 수락과 거절은 **경로가 완전히 같고 메서드만 다르다**
 * (PATCH / DELETE `/crews/{crewId}/requests/{requestId}`).
 * 그래서 경로만 단언하면 수락 코드가 거절을 부르고 있어도 통과한다 — 메서드를 함께 본다.
 */
const recordDecisions = () => {
  const decisions: { method: string; crewId: string; requestId: string }[] = [];

  server.use(
    http.patch(`${BASE}/crews/:crewId/requests/:requestId`, ({ request, params }) => {
      decisions.push({
        method: request.method,
        crewId: String(params.crewId),
        requestId: String(params.requestId),
      });

      return HttpResponse.json({ status: 200, success: true, data: '' });
    }),
    http.delete(`${BASE}/crews/:crewId/requests/:requestId`, ({ request, params }) => {
      decisions.push({
        method: request.method,
        crewId: String(params.crewId),
        requestId: String(params.requestId),
      });

      return HttpResponse.json({ status: 200, success: true, data: '' });
    }),
  );

  return decisions;
};

describe('참가 신청 수락과 거절', () => {
  let shownMessages: string[];

  beforeEach(() => {
    shownMessages = [];
    setMutationErrorPresenter(error => shownMessages.push(error.message));
  });

  it('수락하면 지목한 신청자 한 명만 수락된다', async () => {
    const decisions = recordDecisions();

    const { result } = renderHook(() => useAcceptCrewRequestMutation(42), {
      wrapper: createWrapper(createQueryClient()),
    });

    result.current.mutate(1001);

    await waitFor(() => expect(decisions).toHaveLength(1));
    expect(decisions[0]).toEqual({ method: 'PATCH', crewId: '42', requestId: '1001' });
  });

  it('거절하면 지목한 신청자 한 명만 거절된다', async () => {
    const decisions = recordDecisions();

    const { result } = renderHook(() => useRejectCrewRequestMutation(42), {
      wrapper: createWrapper(createQueryClient()),
    });

    result.current.mutate(2002);

    await waitFor(() => expect(decisions).toHaveLength(1));
    expect(decisions[0]).toEqual({ method: 'DELETE', crewId: '42', requestId: '2002' });
  });

  it('수락이 접수되면 보고 있던 신청자 목록이 다시 조회되어 그 사람이 빠진다', async () => {
    let participantsRequestCount = 0;

    recordDecisions();
    server.use(
      http.get(`${BASE}/crews/42/requests`, () => {
        participantsRequestCount += 1;

        return HttpResponse.json({
          status: 200,
          success: true,
          data: { results: participantsRequestCount === 1 ? [{ id: 1001 }] : [] },
        });
      }),
    );

    const { result } = renderHook(
      () => ({
        // **실제 쿼리 팩토리를 쓴다.** 손으로 쓴 키를 쓰면 팩토리의 키 모양이
        // 바뀌어도 테스트가 통과해 무효화가 끊긴 것을 못 잡는다.
        participants: useQuery(crewQueries.participants({ crewId: 42 })),
        accept: useAcceptCrewRequestMutation(42),
      }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(participantsRequestCount).toBe(1));

    result.current.accept.mutate(1001);

    await waitFor(() => expect(participantsRequestCount).toBe(2));
  });

  it('서버가 수락을 거절하면 그 사유가 크루장에게 전달된다', async () => {
    server.use(
      http.patch(`${BASE}/crews/42/requests/1001`, () =>
        HttpResponse.json({
          status: 200,
          success: false,
          error: { code: 'CRM004', message: '이미 처리된 신청이에요.' },
        }),
      ),
    );

    const { result } = renderHook(() => useAcceptCrewRequestMutation(42), {
      wrapper: createWrapper(createQueryClient()),
    });

    result.current.mutate(1001);

    await waitFor(() => expect(shownMessages).toHaveLength(1));
    expect(shownMessages[0]).toBe('이미 처리된 신청이에요.');
  });
});
