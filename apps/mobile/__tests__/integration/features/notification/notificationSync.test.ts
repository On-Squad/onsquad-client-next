import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { type ReactNode, createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { crewQueries } from '../../../../src/entities/crew/api/crew.queries';
import { notificationQueries } from '../../../../src/entities/notification/api/notification.queries';
import { refreshNotifications } from '../../../../src/screens/notification/refreshNotifications';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const makeNotification = (id: number, read: boolean) => ({
  id,
  topic: 'USER' as const,
  detail: 'CREW_REQUEST',
  occurredAt: '2024-01-15T10:00:00',
  read,
  payload: { crewId: 1, crewName: '테스트크루', message: '가입 신청이 왔어요.' },
});

const notificationListPayload = (items: ReturnType<typeof makeNotification>[]) => ({
  status: 200,
  success: true,
  data: {
    size: 10,
    page: 0,
    totalPages: 1,
    totalCount: items.length,
    resultsSize: items.length,
    results: items,
  },
});

describe('알림 화면 재진입 시 동기화', () => {
  it('refreshNotifications 를 호출하면 알림 목록 쿼리가 재조회된다', async () => {
    let requestCount = 0;

    server.use(
      http.get(`${BASE}/members/me/notifications`, () => {
        requestCount += 1;
        return HttpResponse.json(notificationListPayload([makeNotification(1, false)]));
      }),
    );

    const queryClient = createQueryClient();

    const { result } = renderHook(
      () => useInfiniteQuery(notificationQueries.infiniteList()),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestCount).toBe(1);

    await refreshNotifications({ queryClient });

    await waitFor(() => expect(requestCount).toBe(2));
  });

  it('알림이 읽음으로 바뀐 뒤 refreshNotifications 를 호출하면 갱신된 읽음 상태를 받는다', async () => {
    let serverState = [makeNotification(1, false)];

    server.use(
      http.get(`${BASE}/members/me/notifications`, () =>
        HttpResponse.json(notificationListPayload(serverState)),
      ),
    );

    const queryClient = createQueryClient();

    const { result } = renderHook(
      () => useInfiniteQuery(notificationQueries.infiniteList()),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() =>
      expect(result.current.data?.pages[0].data.results[0].read).toBe(false),
    );

    serverState = [makeNotification(1, true)];
    await refreshNotifications({ queryClient });

    await waitFor(() =>
      expect(result.current.data?.pages[0].data.results[0].read).toBe(true),
    );
  });

  it('refreshNotifications 를 호출해도 크루 목록 쿼리는 재조회되지 않는다', async () => {
    let crewRequestCount = 0;

    server.use(
      http.get(`${BASE}/members/me/notifications`, () =>
        HttpResponse.json(notificationListPayload([])),
      ),
      http.get(`${BASE}/crews`, () => {
        crewRequestCount += 1;
        return HttpResponse.json({
          status: 200,
          success: true,
          data: { resultsSize: 0, results: [] },
        });
      }),
    );

    const queryClient = createQueryClient();

    const { result } = renderHook(
      () => useQuery(crewQueries.list()),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const fetchedAt = result.current.dataUpdatedAt;
    expect(crewRequestCount).toBe(1);

    await refreshNotifications({ queryClient });

    expect(result.current.dataUpdatedAt).toBe(fetchedAt);
    expect(crewRequestCount).toBe(1);
  });

  it('refreshNotifications 를 호출해도 크루 상세 쿼리는 재조회되지 않는다', async () => {
    let crewDetailRequestCount = 0;

    server.use(
      http.get(`${BASE}/members/me/notifications`, () =>
        HttpResponse.json(notificationListPayload([])),
      ),
      http.get(`${BASE}/crews/1`, () => {
        crewDetailRequestCount += 1;
        return HttpResponse.json({
          status: 200,
          success: true,
          data: { crew: { id: 1, name: '테스트크루' } },
        });
      }),
    );

    const queryClient = createQueryClient();

    const { result } = renderHook(
      () => useQuery(crewQueries.detail({ crewId: 1 })),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const fetchedAt = result.current.dataUpdatedAt;
    expect(crewDetailRequestCount).toBe(1);

    await refreshNotifications({ queryClient });

    expect(result.current.dataUpdatedAt).toBe(fetchedAt);
    expect(crewDetailRequestCount).toBe(1);
  });
});
