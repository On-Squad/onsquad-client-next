import { useInfiniteQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { crewQueries } from '@/entities/crew';

import { server } from '../../../setup/msw/server';
import { createWrapper } from '../../utils/wrapper';

const BASE = 'http://localhost/api/bff';

const makeMember = (id: number) => ({
  states: { isMe: false, canKick: false, canDelegateOwner: false },
  participateAt: '2026-01-01T00:00:00',
  member: { id, nickname: `멤버${id}`, introduce: `소개${id}`, mbti: 'ENFP' as const },
});

const membersPage = (results: ReturnType<typeof makeMember>[], page: number, totalPages: number) => ({
  status: 200,
  success: true,
  data: { size: 5, page, totalPages, totalCount: results.length * totalPages, resultsSize: results.length, results },
});

describe('크루원 목록 페이징 — 1-based 중복 없음 (웹)', () => {
  it('첫 요청이 page=1 로 나가 같은 사람이 두 번 로드되지 않는다', async () => {
    /**
     * 서버는 1-based: page=0 과 page=1 이 같은 첫 페이지를 반환한다.
     * 쿼리가 0 으로 시작하면 fetchNextPage 시 page=1 이 다시 오고 — 첫 페이지 중복.
     * 쿼리가 1 로 시작하면 fetchNextPage 시 page=2 가 오므로 중복이 없다.
     */
    const membersByPage: Record<string, number[]> = {
      '1': [101, 102],
      '2': [103, 104],
    };

    server.use(
      http.get(`${BASE}/crews/42/members`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page') ?? '1';
        const ids = membersByPage[page] ?? [];
        return HttpResponse.json(membersPage(ids.map(makeMember), Number(page), 2));
      }),
    );

    const { result } = renderHook(() => useInfiniteQuery(crewQueries.members({ crewId: 42, size: 2 })), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const firstIds = result.current.data?.pages.flatMap((p) => p.data.results.map((m) => m.member.id)) ?? [];

    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));

    const allIds = result.current.data?.pages.flatMap((p) => p.data.results.map((m) => m.member.id)) ?? [];

    expect(new Set(allIds).size).toBe(allIds.length);

    const secondPageIds = allIds.filter((id) => !firstIds.includes(id));
    expect(secondPageIds.length).toBeGreaterThan(0);
  });

  it('더보기를 누르면 다음 페이지가 순차적으로 요청된다', async () => {
    const requestedPages: number[] = [];

    server.use(
      http.get(`${BASE}/crews/42/members`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? '1');
        requestedPages.push(page);
        // size 와 같은 개수를 반환해야 hasNextPage 가 true 가 되어 fetchNextPage 가 동작한다
        const size = 2;
        const results = Array.from({ length: size }, (_, i) => makeMember(page * 10 + i + 1));
        return HttpResponse.json(membersPage(results, page, 3));
      }),
    );

    const { result } = renderHook(() => useInfiniteQuery(crewQueries.members({ crewId: 42, size: 2 })), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));

    expect(requestedPages).toHaveLength(2);
    expect(requestedPages[1]).toBe(requestedPages[0] + 1);
  });

  it('마지막 페이지이면 hasNextPage 가 false 이다', async () => {
    server.use(
      http.get(`${BASE}/crews/42/members`, () => HttpResponse.json(membersPage([makeMember(1), makeMember(2)], 1, 1))),
    );

    const { result } = renderHook(() => useInfiniteQuery(crewQueries.members({ crewId: 42, size: 5 })), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('첫 페이지에 size 만큼 결과가 오면 hasNextPage 가 true 이다', async () => {
    server.use(
      http.get(`${BASE}/crews/42/members`, () =>
        HttpResponse.json(
          membersPage(
            Array.from({ length: 5 }, (_, i) => makeMember(i + 1)),
            1,
            2,
          ),
        ),
      ),
    );

    const { result } = renderHook(() => useInfiniteQuery(crewQueries.members({ crewId: 42, size: 5 })), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });
});
