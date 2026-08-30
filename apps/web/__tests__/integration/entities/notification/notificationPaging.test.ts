import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { type ReactNode, createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { notificationQueries } from '@/entities/notification/api/notification.queries';

import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost/api/bff';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const item = (id: number) => ({
  id,
  topic: 'USER',
  detail: 'CREW_REQUEST',
  occurredAt: '2026-08-30T12:00:00',
  read: false,
  payload: { crewId: 20, crewName: '크루 이름 20', message: `${id}번 알림` },
});

/**
 * **알림 목록 API 는 1-based 다.** `page=0` 과 `page=1` 이 같은 첫 페이지를 준다 —
 * 응답의 `page` 필드가 둘 다 1 로 오는 것으로 확인했다(로컬 백엔드 실측).
 * 0 부터 요청하면 첫 페이지를 두 번 받는다.
 */
const serveOneBasedPages = () => {
  server.use(
    http.get(`${BASE}/members/me/notifications`, ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page') ?? 1);
      const results = page <= 1 ? [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(item) : [];

      return HttpResponse.json({
        status: 200,
        success: true,
        data: {
          size: 10,
          page: Math.max(page, 1),
          totalPages: 1,
          totalCount: 10,
          resultsSize: results.length,
          results,
        },
      });
    }),
  );
};

describe('알림이 딱 한 페이지를 채울 때', () => {
  it('다음 페이지를 더 받아도 같은 알림이 두 번 보이지 않는다', async () => {
    serveOneBasedPages();

    const { result } = renderHook(() => useInfiniteQuery(notificationQueries.infiniteList()), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // 10건이 꽉 찼으니 목록은 다음 페이지가 있다고 판단한다 — 끝까지 스크롤한 상황이다.
    expect(result.current.hasNextPage).toBe(true);

    const next = await result.current.fetchNextPage();

    expect(next.data?.pages).toHaveLength(2);

    const ids = (next.data?.pages ?? []).flatMap((page) => page.data.results.map((r) => r.id));

    // 같은 알림이 두 번 들어가면 목록의 key 가 겹쳐 항목이 사라지거나 중복된다.
    expect(new Set(ids).size).toBe(ids.length);
  });
});
