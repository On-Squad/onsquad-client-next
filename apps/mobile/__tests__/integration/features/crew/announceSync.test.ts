import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { type ReactNode, createElement } from 'react';
import { describe, expect, it } from 'vitest';

import { crewQueries } from '../../../../src/entities/crew/api/crew.queries';
import { refreshAnnounces } from '../../../../src/screens/announceList/refreshAnnounces';
import { server } from '../../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

const announcePayload = ({ title, pinned }: { title: string; pinned: boolean }) => ({
  status: 200,
  success: true,
  data: {
    states: { canWrite: true, role: 'OWNER' },
    announces: [
      {
        id: 1,
        title,
        content: '# 본문',
        createdAt: '2026-08-01T00:00:00',
        pinned,
        pinnedAt: '',
        writer: { id: 1, nickname: '브레멘', introduce: '', mbti: 'ENFP', role: 'OWNER' },
        states: { role: 'OWNER' },
      },
    ],
  },
});

/**
 * 서버가 돌려줄 목록을 테스트 도중에 바꾼다.
 * 웹뷰에서 상단고정을 누르거나 새 공지를 쓴 상황을 흉내 내는 장치다 —
 * RN 목록은 그 호출에 관여하지 않고, 서버 상태만 달라진 채로 화면에 돌아온다.
 */
const serveAnnounces = () => {
  let current = announcePayload({ title: '첫 공지', pinned: false });

  server.use(http.get(`${BASE}/crews/:crewId/announces`, () => HttpResponse.json(current)));

  return {
    webviewPinsTheAnnounce: () => {
      current = announcePayload({ title: '첫 공지', pinned: true });
    },
    webviewAddsAnnounce: (title: string) => {
      current = announcePayload({ title, pinned: false });
    },
  };
};

describe('공지 목록으로 돌아왔을 때', () => {
  it('웹뷰에서 상단고정한 공지가 목록에서도 고정으로 보인다', async () => {
    const server_ = serveAnnounces();
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useQuery(crewQueries.announceList({ crewId: 1 })), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.data?.data.announces[0].pinned).toBe(false));

    server_.webviewPinsTheAnnounce();
    await refreshAnnounces({ queryClient, crewId: 1 });

    await waitFor(() => expect(result.current.data?.data.announces[0].pinned).toBe(true));
  });

  it('웹뷰에서 새로 쓴 공지의 제목이 목록에 보인다', async () => {
    const server_ = serveAnnounces();
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useQuery(crewQueries.announceList({ crewId: 1 })), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.data?.data.announces[0].title).toBe('첫 공지'));

    server_.webviewAddsAnnounce('오늘 모임 공지');
    await refreshAnnounces({ queryClient, crewId: 1 });

    await waitFor(() => expect(result.current.data?.data.announces[0].title).toBe('오늘 모임 공지'));
  });

  it('다른 크루의 공지 목록은 다시 받지 않는다', async () => {
    serveAnnounces();
    const queryClient = createQueryClient();

    const { result } = renderHook(() => useQuery(crewQueries.announceList({ crewId: 2 })), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const fetchedAt = result.current.dataUpdatedAt;

    await refreshAnnounces({ queryClient, crewId: 1 });

    expect(result.current.dataUpdatedAt).toBe(fetchedAt);
  });
});
