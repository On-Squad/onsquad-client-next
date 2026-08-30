import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { type ReactNode, createElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { notificationQueries } from '../../../../src/entities/notification';
import { registerSessionRefresh } from '../../../../src/shared/lib/auth/sessionRefresh';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

/**
 * 실제 응답 봉투의 모양. 성공이면 `data`, 실패면 `error` 가 온다 — **둘 다 선택적이다.**
 * 이렇게 두지 않으면 MSW 리졸버가 첫 분기로 반환 타입을 굳혀 성공/실패를 한 핸들러에 못 담는다.
 */
interface NotificationEnvelope {
  status: number;
  success: boolean;
  error?: { code: string; message: string };
  data?: {
    size: number;
    page: number;
    totalPages: number;
    totalCount: number;
    resultsSize: number;
    results: unknown[];
  };
}

const page = (results: unknown[]) =>
  HttpResponse.json<NotificationEnvelope>({
    status: 200,
    success: true,
    data: { size: 10, page: 0, totalPages: 1, totalCount: results.length, resultsSize: results.length, results },
  });

/**
 * 백엔드는 인증 실패도 **HTTP 200** 으로 내려준다. 실패는 본문 봉투에만 있다.
 * 그래서 `response.ok` 로는 걸러지지 않는다 — 실측으로 확인한 응답 그대로다.
 */
const authFailure = (code: string, message: string) =>
  HttpResponse.json<NotificationEnvelope>(
    { status: 401, success: false, error: { code, message } },
    { status: 200 },
  );

const anAnnounceNotification = {
  id: 1,
  topic: 'USER',
  detail: 'CREW_REQUEST',
  occurredAt: '2026-08-30T12:00:00',
  read: false,
  payload: { crewId: 20, crewName: '크루 이름 20', message: '닉네임7 님이 크루 합류를 요청하였습니다.' },
};

afterEach(() => registerSessionRefresh(null));

describe('알림 목록을 보는 중에 토큰이 만료됐을 때', () => {
  it('세션이 갱신되면 사용자는 만료를 눈치채지 못하고 목록을 본다', async () => {
    // 서버는 "토큰이 필요한 API"(T004)로 답한다. 만료(T003)와 코드가 다르다.
    let served = 0;
    server.use(
      http.get(`${BASE}/members/me/notifications`, () => {
        served += 1;
        return served === 1 ? authFailure('T004', '토큰이 필요한 API 입니다.') : page([anAnnounceNotification]);
      }),
    );
    registerSessionRefresh(() => Promise.resolve(true));

    const { result } = renderHook(() => useInfiniteQuery(notificationQueries.infiniteList()), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.data?.pages[0].data.results).toHaveLength(1));
    expect(result.current.isError).toBe(false);
  });

  it('갱신할 수단이 없으면 목록은 오류로 끝난다 — 화면이 터지지 않는다', async () => {
    // 갱신 함수가 등록돼 있지 않다(로그아웃 직후 등). 봉투가 그대로 화면까지 온다.
    server.use(
      http.get(`${BASE}/members/me/notifications`, () => authFailure('T004', '토큰이 필요한 API 입니다.')),
    );

    const { result } = renderHook(() => useInfiniteQuery(notificationQueries.infiniteList()), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // 봉투를 벗기다 undefined 를 읽으면 TypeError 가 난다. 그건 폴백이 아니라 빨간 화면이다.
    expect(result.current.error).not.toBeInstanceOf(TypeError);
    expect(result.current.error?.message).toBe('토큰이 필요한 API 입니다.');
  });

  it('벨 배지 조회도 같은 봉투에서 오류로 끝난다', async () => {
    server.use(
      http.get(`${BASE}/members/me/notifications`, () => authFailure('T004', '토큰이 필요한 API 입니다.')),
    );

    const { result } = renderHook(() => useQuery(notificationQueries.badge()), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).not.toBeInstanceOf(TypeError);
    expect(result.current.error?.message).toBe('토큰이 필요한 API 입니다.');
  });
});
