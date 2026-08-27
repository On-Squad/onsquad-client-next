import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
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

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const announcePayload = (title: string) => ({
  status: 200,
  success: true,
  data: {
    states: { canWrite: false, role: 'MEMBER' },
    announces: [
      {
        id: 1,
        title,
        content: '# 본문',
        createdAt: '2026-08-01T00:00:00',
        pinned: false,
        pinnedAt: '',
        writer: { id: 1, nickname: '브레멘', introduce: '', mbti: 'ENFP', role: 'OWNER' },
        states: { role: 'OWNER' },
      },
    ],
  },
});

/** 어느 크루의 공지를 조회했는지 경로로 기록한다. */
const recordAnnounceRequests = () => {
  const requestedPaths: string[] = [];

  server.use(
    http.get(`${BASE}/crews/:crewId/announces`, ({ request, params }) => {
      requestedPaths.push(new URL(request.url).pathname);

      return HttpResponse.json(announcePayload(`${String(params.crewId)}번 크루 공지`));
    }),
  );

  return requestedPaths;
};

describe('크루 공지 목록', () => {
  it('목록 화면에 들어가면 지금 보고 있는 크루의 공지를 조회한다', async () => {
    const requestedPaths = recordAnnounceRequests();

    renderHook(() => useQuery(crewQueries.announceList({ crewId: 42 })), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(requestedPaths).toHaveLength(1));
    expect(requestedPaths[0]).toBe('/api/crews/42/announces');
  });

  it('다른 크루의 목록으로 들어가면 그 크루의 공지를 새로 조회한다', async () => {
    const requestedPaths = recordAnnounceRequests();
    const queryClient = createQueryClient();

    const { rerender } = renderHook(({ crewId }: { crewId: number }) => useQuery(crewQueries.announceList({ crewId })), {
      wrapper: createWrapper(queryClient),
      initialProps: { crewId: 42 },
    });

    await waitFor(() => expect(requestedPaths).toHaveLength(1));

    rerender({ crewId: 7 });

    await waitFor(() => expect(requestedPaths).toHaveLength(2));
    expect(requestedPaths[0]).toBe('/api/crews/42/announces');
    expect(requestedPaths[1]).toBe('/api/crews/7/announces');
  });

  it('서버가 내려준 공지 제목이 목록에 실린다', async () => {
    recordAnnounceRequests();

    const { result } = renderHook(() => useQuery(crewQueries.announceList({ crewId: 42 })), {
      wrapper: createWrapper(createQueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.announces[0].title).toBe('42번 크루 공지');
  });
});
