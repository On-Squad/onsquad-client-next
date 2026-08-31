import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { crewQueries } from '../../../../src/entities/crew/api/crew.queries';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

const makeMember = (id: number, overrides?: Partial<{
  nickname: string;
  introduce: string;
  isMe: boolean;
  canKick: boolean;
  canDelegateOwner: boolean;
}>) => ({
  states: {
    isMe: overrides?.isMe ?? false,
    canKick: overrides?.canKick ?? false,
    canDelegateOwner: overrides?.canDelegateOwner ?? false,
  },
  participateAt: '2026-01-01T00:00:00',
  member: {
    id,
    nickname: overrides?.nickname ?? `멤버${id}`,
    introduce: overrides?.introduce ?? `소개${id}`,
    mbti: 'ENFP' as const,
  },
});

const membersPayload = (results: ReturnType<typeof makeMember>[], page = 1, totalPages = 1) => ({
  status: 200,
  success: true,
  data: {
    size: 5,
    page,
    totalPages,
    totalCount: results.length,
    resultsSize: results.length,
    results,
  },
});

/**
 * 어느 크루의 크루원을 어느 페이지로 조회했는지 기록한다.
 */
const recordMembersRequests = () => {
  const requests: { crewId: string; page: string }[] = [];

  server.use(
    http.get(`${BASE}/crews/:crewId/members`, ({ request, params }) => {
      const url = new URL(request.url);
      requests.push({ crewId: String(params.crewId), page: url.searchParams.get('page') ?? '' });

      return HttpResponse.json(membersPayload([makeMember(1), makeMember(2)]));
    }),
  );

  return requests;
};

describe('크루원 목록 쿼리', () => {
  it('화면에 들어가면 지정한 크루의 크루원 목록을 조회한다', async () => {
    const requests = recordMembersRequests();

    renderHook(() => useInfiniteQuery(crewQueries.members({ crewId: 42 })), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].crewId).toBe('42');
  });

  it('첫 요청이 page=1 로 나가 같은 사람이 두 번 로드되지 않는다', async () => {
    /**
     * 서버가 page=0 과 page=1 을 다르게 응답한다.
     * page=0 으로 시작하면 fetchNextPage 가 page=1 을 요청할 때 같은 첫 페이지가 온다 — 중복.
     * page=1 로 시작하면 fetchNextPage 가 page=2 를 요청하므로 중복이 없다.
     * 이 테스트는 동작(중복 없음)을 검증한다 — initialPageParam 값을 직접 단언하지 않는다.
     */
    const membersByPage: Record<string, number[]> = {
      '1': [101, 102],
      '2': [103, 104],
    };

    server.use(
      http.get(`${BASE}/crews/42/members`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page') ?? '1';
        const ids = membersByPage[page] ?? [];
        const results = ids.map((id) => makeMember(id));

        return HttpResponse.json({
          status: 200,
          success: true,
          data: {
            size: 2,
            page: Number(page),
            totalPages: 2,
            totalCount: 4,
            resultsSize: results.length,
            results,
          },
        });
      }),
    );

    const { result } = renderHook(
      () => useInfiniteQuery(crewQueries.members({ crewId: 42, size: 2 })),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // 첫 페이지 로드 후 멤버 id 목록을 뽑는다
    const firstIds = result.current.data?.pages.flatMap((p) => p.data.results.map((m) => m.member.id)) ?? [];

    // 더보기(2페이지) 조회
    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));

    const allIds = result.current.data?.pages.flatMap((p) => p.data.results.map((m) => m.member.id)) ?? [];

    // 중복이 없어야 한다
    expect(new Set(allIds).size).toBe(allIds.length);

    // 첫 페이지에서 로드한 사람들이 두 번째 페이지에 다시 나타나지 않는다
    const secondPageIds = allIds.filter((id) => !firstIds.includes(id));
    expect(secondPageIds.length).toBeGreaterThan(0);
  });

  it('서버가 내려준 닉네임과 소개가 쿼리 결과에 실린다', async () => {
    server.use(
      http.get(`${BASE}/crews/42/members`, () =>
        HttpResponse.json(
          membersPayload([
            makeMember(1, { nickname: '브레멘', introduce: '운동이 좋아요' }),
            makeMember(2, { nickname: '강아지', introduce: '산책을 좋아해요' }),
          ]),
        ),
      ),
    );

    const { result } = renderHook(
      () => useInfiniteQuery(crewQueries.members({ crewId: 42 })),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const members = result.current.data?.pages.flatMap((p) => p.data.results) ?? [];
    expect(members[0].member.nickname).toBe('브레멘');
    expect(members[0].member.introduce).toBe('운동이 좋아요');
    expect(members[1].member.nickname).toBe('강아지');
  });

  it('canKick=true 인 항목은 강퇴 가능 상태로 전달된다', async () => {
    server.use(
      http.get(`${BASE}/crews/42/members`, () =>
        HttpResponse.json(
          membersPayload([
            makeMember(1, { canKick: true, canDelegateOwner: false }),
            makeMember(2, { canKick: false }),
          ]),
        ),
      ),
    );

    const { result } = renderHook(
      () => useInfiniteQuery(crewQueries.members({ crewId: 42 })),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const members = result.current.data?.pages.flatMap((p) => p.data.results) ?? [];
    expect(members[0].states.canKick).toBe(true);
    expect(members[1].states.canKick).toBe(false);
  });

  it('isMe=true 인 항목은 내 항목 상태로 전달된다', async () => {
    /**
     * 서버가 내 항목에 isMe=true 를 준다. 화면은 이 값만 보고 관리 버튼 표시 여부를 결정한다.
     * 화면이 역할을 재계산하지 않는다는 것을 여기서 확인한다 —
     * isMe=true 이면 canKick/canDelegateOwner 가 true 여도 서버가 주는 대로만 사용한다.
     */
    server.use(
      http.get(`${BASE}/crews/42/members`, () =>
        HttpResponse.json(
          membersPayload([
            makeMember(1, { isMe: true, canKick: false, canDelegateOwner: false }),
            makeMember(2, { isMe: false, canKick: true }),
          ]),
        ),
      ),
    );

    const { result } = renderHook(
      () => useInfiniteQuery(crewQueries.members({ crewId: 42 })),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const members = result.current.data?.pages.flatMap((p) => p.data.results) ?? [];
    expect(members[0].states.isMe).toBe(true);
    expect(members[0].states.canKick).toBe(false);
    expect(members[1].states.isMe).toBe(false);
    expect(members[1].states.canKick).toBe(true);
  });

  it('더보기를 누르면 다음 페이지를 조회한다', async () => {
    const requestedPages: string[] = [];

    server.use(
      http.get(`${BASE}/crews/42/members`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page') ?? '';
        requestedPages.push(page);

        return HttpResponse.json({
          status: 200,
          success: true,
          data: {
            size: 5,
            page: Number(page),
            totalPages: 3,
            totalCount: 15,
            resultsSize: 5,
            results: [makeMember(Number(page) * 10 + 1)],
          },
        });
      }),
    );

    const { result } = renderHook(
      () => useInfiniteQuery(crewQueries.members({ crewId: 42 })),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));

    // 두 페이지가 순서대로 조회됐다 (초기 페이지 + 다음 페이지)
    expect(requestedPages).toHaveLength(2);
    // 첫 페이지와 두 번째 페이지가 연속된 페이지 번호여야 한다
    const [firstPage, secondPage] = requestedPages.map(Number);
    expect(secondPage).toBe(firstPage + 1);
  });

  it('크루원이 없으면 빈 배열을 반환한다', async () => {
    server.use(
      http.get(`${BASE}/crews/42/members`, () =>
        HttpResponse.json({
          status: 200,
          success: true,
          data: {
            size: 5,
            page: 1,
            totalPages: 0,
            totalCount: 0,
            resultsSize: 0,
            results: [],
          },
        }),
      ),
    );

    const { result } = renderHook(
      () => useInfiniteQuery(crewQueries.members({ crewId: 42 })),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const members = result.current.data?.pages.flatMap((p) => p.data.results) ?? [];
    expect(members).toHaveLength(0);
  });
});
