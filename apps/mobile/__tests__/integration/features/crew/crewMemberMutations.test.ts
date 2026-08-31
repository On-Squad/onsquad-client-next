import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { crewQueries } from '../../../../src/entities/crew/api/crew.queries';
import { useDelegateCrewOwnerMutation } from '../../../../src/features/crew/manage/members/model/useDelegateCrewOwnerMutation';
import { useKickCrewMemberMutation } from '../../../../src/features/crew/manage/members/model/useKickCrewMemberMutation';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

const makeMember = (id: number) => ({
  states: { isMe: false, canKick: true, canDelegateOwner: true },
  participateAt: '2026-01-01T00:00:00',
  member: { id, nickname: `멤버${id}`, introduce: `소개${id}`, mbti: 'ENFP' as const },
});

const membersResponse = (results: ReturnType<typeof makeMember>[]) => ({
  status: 200,
  success: true,
  data: { size: 5, page: 1, totalPages: 1, totalCount: results.length, resultsSize: results.length, results },
});

const manageResponse = () => ({
  status: 200,
  success: true,
  data: { states: { canModify: false, canDelete: false }, requestCnt: 0, squadCnt: 0, memberCnt: 3 },
});

describe('크루원 강퇴 뮤테이션', () => {
  it('강퇴를 실행하면 지정한 크루원 삭제 요청이 서버로 나간다', async () => {
    const receivedRequests: { crewId: string; targetMemberId: string }[] = [];

    server.use(
      http.delete(`${BASE}/crews/:crewId/members/:targetMemberId`, ({ params }) => {
        receivedRequests.push({
          crewId: String(params.crewId),
          targetMemberId: String(params.targetMemberId),
        });
        return HttpResponse.json({ status: 200, success: true });
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useKickCrewMemberMutation(99), {
      wrapper: createWrapper(queryClient),
    });

    await act(() => result.current.mutate(42));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(receivedRequests).toHaveLength(1);
    expect(receivedRequests[0].crewId).toBe('99');
    expect(receivedRequests[0].targetMemberId).toBe('42');
  });

  it('강퇴 성공 후 크루원 목록이 다시 조회된다', async () => {
    let membersRequestCount = 0;

    server.use(
      http.get(`${BASE}/crews/99/members`, () => {
        membersRequestCount += 1;
        return HttpResponse.json(membersResponse([makeMember(1), makeMember(2)]));
      }),
      http.delete(`${BASE}/crews/99/members/:targetMemberId`, () =>
        HttpResponse.json({ status: 200, success: true }),
      ),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({
        members: useInfiniteQuery(crewQueries.members({ crewId: 99 })),
        kick: useKickCrewMemberMutation(99),
      }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(membersRequestCount).toBe(1));

    await act(() => result.current.kick.mutate(2));
    await waitFor(() => expect(membersRequestCount).toBe(2));
  });

  it('강퇴 성공 후 관리 상태도 다시 조회된다', async () => {
    let manageRequestCount = 0;

    server.use(
      http.get(`${BASE}/crews/99/manage`, () => {
        manageRequestCount += 1;
        return HttpResponse.json(manageResponse());
      }),
      http.delete(`${BASE}/crews/99/members/:targetMemberId`, () =>
        HttpResponse.json({ status: 200, success: true }),
      ),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({
        manage: useQuery(crewQueries.manage({ crewId: 99 })),
        kick: useKickCrewMemberMutation(99),
      }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(manageRequestCount).toBe(1));

    await act(() => result.current.kick.mutate(2));
    await waitFor(() => expect(manageRequestCount).toBe(2));
  });

  it('뮤테이션을 호출하지 않으면 강퇴 요청이 나가지 않는다', async () => {
    /**
     * 취소 시나리오 — 확인 알럿에서 취소를 누르면 mutate() 가 호출되지 않는다.
     * mutate() 없이는 HTTP 요청이 나가지 않음을 훅 수준에서 확인한다.
     */
    const receivedRequests: string[] = [];

    server.use(
      http.delete(`${BASE}/crews/99/members/:targetMemberId`, ({ params }) => {
        receivedRequests.push(String(params.targetMemberId));
        return HttpResponse.json({ status: 200, success: true });
      }),
    );

    const queryClient = createQueryClient();
    renderHook(() => useKickCrewMemberMutation(99), {
      wrapper: createWrapper(queryClient),
    });

    // mutate() 를 호출하지 않는다 — 취소한 것과 동일한 상태
    expect(receivedRequests).toHaveLength(0);
  });

  it('서버가 거절하면 뮤테이션이 에러 상태가 된다', async () => {
    server.use(
      http.delete(`${BASE}/crews/99/members/:targetMemberId`, () =>
        HttpResponse.json({
          status: 200,
          success: false,
          error: { code: 'CRM001', message: '강퇴할 권한이 없습니다.' },
        }),
      ),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useKickCrewMemberMutation(99), {
      wrapper: createWrapper(queryClient),
    });

    await act(() => result.current.mutate(2));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('크루장 위임 뮤테이션', () => {
  it('크루장 위임을 실행하면 지정한 크루원 위임 요청이 서버로 나간다', async () => {
    const receivedRequests: { crewId: string; targetMemberId: string }[] = [];

    server.use(
      http.patch(`${BASE}/crews/:crewId/members/:targetMemberId/owner`, ({ params }) => {
        receivedRequests.push({
          crewId: String(params.crewId),
          targetMemberId: String(params.targetMemberId),
        });
        return HttpResponse.json({ status: 200, success: true });
      }),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useDelegateCrewOwnerMutation(99), {
      wrapper: createWrapper(queryClient),
    });

    await act(() => result.current.mutate(42));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(receivedRequests).toHaveLength(1);
    expect(receivedRequests[0].crewId).toBe('99');
    expect(receivedRequests[0].targetMemberId).toBe('42');
  });

  it('위임 성공 후 크루원 목록이 다시 조회된다', async () => {
    let membersRequestCount = 0;

    server.use(
      http.get(`${BASE}/crews/99/members`, () => {
        membersRequestCount += 1;
        return HttpResponse.json(membersResponse([makeMember(1), makeMember(2)]));
      }),
      http.patch(`${BASE}/crews/99/members/:targetMemberId/owner`, () =>
        HttpResponse.json({ status: 200, success: true }),
      ),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({
        members: useInfiniteQuery(crewQueries.members({ crewId: 99 })),
        delegate: useDelegateCrewOwnerMutation(99),
      }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(membersRequestCount).toBe(1));

    await act(() => result.current.delegate.mutate(2));
    await waitFor(() => expect(membersRequestCount).toBe(2));
  });

  it('위임 성공 후 관리 상태도 다시 조회된다 — 내 권한이 바뀌기 때문이다', async () => {
    /**
     * 위임 후에는 현재 사용자가 더 이상 크루장이 아니다.
     * 관리 화면의 상태(크루원 수·신청자 수·권한)가 바뀌므로 manage 쿼리를 다시 받아야 한다.
     */
    let manageRequestCount = 0;

    server.use(
      http.get(`${BASE}/crews/99/manage`, () => {
        manageRequestCount += 1;
        return HttpResponse.json(manageResponse());
      }),
      http.patch(`${BASE}/crews/99/members/:targetMemberId/owner`, () =>
        HttpResponse.json({ status: 200, success: true }),
      ),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({
        manage: useQuery(crewQueries.manage({ crewId: 99 })),
        delegate: useDelegateCrewOwnerMutation(99),
      }),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(manageRequestCount).toBe(1));

    await act(() => result.current.delegate.mutate(2));
    await waitFor(() => expect(manageRequestCount).toBe(2));
  });

  it('뮤테이션을 호출하지 않으면 위임 요청이 나가지 않는다', async () => {
    const receivedRequests: string[] = [];

    server.use(
      http.patch(`${BASE}/crews/99/members/:targetMemberId/owner`, ({ params }) => {
        receivedRequests.push(String(params.targetMemberId));
        return HttpResponse.json({ status: 200, success: true });
      }),
    );

    const queryClient = createQueryClient();
    renderHook(() => useDelegateCrewOwnerMutation(99), {
      wrapper: createWrapper(queryClient),
    });

    expect(receivedRequests).toHaveLength(0);
  });

  it('서버가 거절하면 뮤테이션이 에러 상태가 된다', async () => {
    server.use(
      http.patch(`${BASE}/crews/99/members/:targetMemberId/owner`, () =>
        HttpResponse.json({
          status: 200,
          success: false,
          error: { code: 'CRM002', message: '위임할 권한이 없습니다.' },
        }),
      ),
    );

    const queryClient = createQueryClient();
    const { result } = renderHook(() => useDelegateCrewOwnerMutation(99), {
      wrapper: createWrapper(queryClient),
    });

    await act(() => result.current.mutate(2));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
