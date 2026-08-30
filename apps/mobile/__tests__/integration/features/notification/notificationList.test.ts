import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { notificationQueries } from '../../../../src/entities/notification/api/notification.queries';
import { useReadAllNotificationMutation } from '../../../../src/entities/notification/api/useReadAllNotificationMutation';
import { useReadNotificationMutation } from '../../../../src/entities/notification/api/useReadNotificationMutation';
import { apiFetch } from '../../../../src/shared/api/common';
import type { ResponseModel } from '../../../../src/shared/api/model';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const makeItem = (id: number) => ({
  id,
  topic: 'USER' as const,
  detail: 'CREW_REQUEST',
  occurredAt: '2024-01-15T10:00:00',
  read: false,
  payload: { crewId: 1, crewName: '테스트크루', message: '가입 신청이 왔어요.' },
});

describe('알림 목록 무한 쿼리', () => {
  it('10개 결과를 받으면 다음 페이지가 존재한다', async () => {
    const items = Array.from({ length: 10 }, (_, i) => makeItem(i + 1));

    server.use(
      http.get(`${BASE}/members/me/notifications`, () =>
        HttpResponse.json({
          status: 200,
          success: true,
          data: {
            size: 10,
            page: 0,
            totalPages: 2,
            totalCount: 15,
            resultsSize: 10,
            results: items,
          },
        }),
      ),
    );

    const { result } = renderHook(() => useInfiniteQuery(notificationQueries.infiniteList()), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('10개 미만 결과를 받으면 마지막 페이지다', async () => {
    const items = Array.from({ length: 5 }, (_, i) => makeItem(i + 1));

    server.use(
      http.get(`${BASE}/members/me/notifications`, () =>
        HttpResponse.json({
          status: 200,
          success: true,
          data: {
            size: 10,
            page: 0,
            totalPages: 1,
            totalCount: 5,
            resultsSize: 5,
            results: items,
          },
        }),
      ),
    );

    const { result } = renderHook(() => useInfiniteQuery(notificationQueries.infiniteList()), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('빈 목록을 받으면 다음 페이지가 없다', async () => {
    // 기본 핸들러(results:[])가 응답

    const { result } = renderHook(() => useInfiniteQuery(notificationQueries.infiniteList()), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.data?.pages[0].data.results).toHaveLength(0);
  });
});

describe('알림 읽음 처리', () => {
  it('읽음 처리하면 해당 알림의 읽음 처리 경로로 요청이 나간다', async () => {
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

    result.current.mutate(42);

    await waitFor(() => expect(patched).toHaveLength(1));
    expect(patched[0]).toBe('/api/notifications/42/read');
  });

  it('읽음 처리가 완료되면 알림 목록 쿼리가 무효화되어 재조회된다', async () => {
    let listRequestCount = 0;

    server.use(
      http.get(`${BASE}/members/me/notifications`, () => {
        listRequestCount += 1;
        return HttpResponse.json({
          status: 200,
          success: true,
          data: { size: 10, page: 0, totalPages: 1, totalCount: 0, resultsSize: 0, results: [] },
        });
      }),
      http.patch(`${BASE}/notifications/1/read`, () =>
        HttpResponse.json({ status: 200, success: true }),
      ),
    );

    const { result } = renderHook(
      () => ({
        list: useQuery({
          queryKey: notificationQueries.root(),
          queryFn: () => apiFetch.get<ResponseModel>('/members/me/notifications'),
        }),
        read: useReadNotificationMutation(),
      }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(listRequestCount).toBe(1));

    result.current.read.mutate(1);

    await waitFor(() => expect(listRequestCount).toBe(2));
  });
});

describe('알림 모두 읽음', () => {
  it('모두 읽음 처리하면 모두 읽음 경로로 요청이 나간다', async () => {
    const patched: string[] = [];

    server.use(
      http.patch(`${BASE}/notifications/read-all`, ({ request }) => {
        patched.push(new URL(request.url).pathname);
        return HttpResponse.json({ status: 200, success: true });
      }),
    );

    const { result } = renderHook(() => useReadAllNotificationMutation(), {
      wrapper: createWrapper(createQueryClient()),
    });

    result.current.mutate();

    await waitFor(() => expect(patched).toHaveLength(1));
    expect(patched[0]).toBe('/api/notifications/read-all');
  });

  it('모두 읽음이 완료되면 알림 목록 쿼리가 무효화되어 재조회된다', async () => {
    let listRequestCount = 0;

    server.use(
      http.get(`${BASE}/members/me/notifications`, () => {
        listRequestCount += 1;
        return HttpResponse.json({
          status: 200,
          success: true,
          data: { size: 10, page: 0, totalPages: 1, totalCount: 0, resultsSize: 0, results: [] },
        });
      }),
      http.patch(`${BASE}/notifications/read-all`, () =>
        HttpResponse.json({ status: 200, success: true }),
      ),
    );

    const { result } = renderHook(
      () => ({
        list: useQuery({
          queryKey: notificationQueries.root(),
          queryFn: () => apiFetch.get<ResponseModel>('/members/me/notifications'),
        }),
        readAll: useReadAllNotificationMutation(),
      }),
      { wrapper: createWrapper(createQueryClient()) },
    );

    await waitFor(() => expect(listRequestCount).toBe(1));

    result.current.readAll.mutate();

    await waitFor(() => expect(listRequestCount).toBe(2));
  });
});
