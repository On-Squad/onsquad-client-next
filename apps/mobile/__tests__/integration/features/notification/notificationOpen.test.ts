import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { notificationQueries } from '../../../../src/entities/notification/api/notification.queries';
import { useReadNotificationMutation } from '../../../../src/entities/notification/api/useReadNotificationMutation';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const makeUnreadItem = (id: number) => ({
  id,
  topic: 'USER' as const,
  detail: 'CREW_ACCEPT',
  occurredAt: '2024-01-15T10:00:00',
  read: false,
  payload: { crewId: 42, crewName: '런닝크루', message: '크루 합류가 수락되었습니다.' },
});

describe('알림 열기 — 읽음 처리 fire-and-forget', () => {
  it('안읽음 알림을 열면 해당 알림 ID 로 읽음 요청이 나간다', async () => {
    const patched: string[] = [];

    server.use(
      http.patch(`${BASE}/notifications/:notificationId/read`, ({ request }) => {
        patched.push(new URL(request.url).pathname);
        return HttpResponse.json({ status: 200, success: true });
      }),
    );

    const { result } = renderHook(() => useReadNotificationMutation(), {
      wrapper: createWrapper(createQueryClient()),
    });

    result.current.mutate(makeUnreadItem(7).id);

    await waitFor(() => expect(patched).toHaveLength(1));
    expect(patched[0]).toBe('/api/notifications/7/read');
  });

  it('서버가 읽음 처리를 거부해도 mutate() 호출이 에러를 전파하지 않는다', async () => {
    server.use(
      http.patch(`${BASE}/notifications/:notificationId/read`, () =>
        HttpResponse.json({ status: 500, success: false }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useReadNotificationMutation(), {
      wrapper: createWrapper(createQueryClient()),
    });

    expect(() => result.current.mutate(99)).not.toThrow();

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('읽음 처리가 완료되면 알림 목록 쿼리가 무효화되어 재조회된다 — 이동 후 목록 갱신', async () => {
    let listRequestCount = 0;

    server.use(
      http.get(`${BASE}/members/me/notifications`, () => {
        listRequestCount += 1;
        return HttpResponse.json({
          status: 200,
          success: true,
          data: {
            size: 10,
            page: 0,
            totalPages: 1,
            totalCount: 1,
            resultsSize: 1,
            results: [{ ...makeUnreadItem(7), read: listRequestCount > 1 }],
          },
        });
      }),
      http.patch(`${BASE}/notifications/7/read`, () =>
        HttpResponse.json({ status: 200, success: true }),
      ),
    );

    const { result } = renderHook(
      () => ({
        list: useInfiniteQuery(notificationQueries.infiniteList()),
        read: useReadNotificationMutation(),
      }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(listRequestCount).toBe(1));

    result.current.read.mutate(7);

    await waitFor(() => expect(listRequestCount).toBe(2));
  });

  it('목록 조회 시 안읽음 항목의 payload.crewId 가 접근 가능하다 — 열기 대상 식별', async () => {
    server.use(
      http.get(`${BASE}/members/me/notifications`, () =>
        HttpResponse.json({
          status: 200,
          success: true,
          data: {
            size: 10,
            page: 0,
            totalPages: 1,
            totalCount: 1,
            resultsSize: 1,
            results: [makeUnreadItem(3)],
          },
        }),
      ),
    );

    const { result } = renderHook(
      () => useInfiniteQuery(notificationQueries.infiniteList()),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const firstItem = result.current.data!.pages[0].data.results[0];
    expect(firstItem.payload?.crewId).toBe(42);
    expect(firstItem.read).toBe(false);
  });
});
