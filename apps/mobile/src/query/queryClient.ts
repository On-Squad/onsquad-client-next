import { QueryClient } from '@tanstack/react-query';

/**
 * RN 전용 QueryClient.
 *
 * `apps/web` 의 `getQueryClient()` 를 재사용하지 않는다 — 그 안의 토큰 만료 처리가
 * `next-auth/react` 를 동적 import 하는데, **Metro 는 코드 스플리팅을 하지 않아
 * 동적 import 도 번들에 적재한다.** (타임아웃 토스트와 같은 병이다)
 *
 * 셸이 세션을 쥐는 구조로 가면 만료 처리도 셸 몫이므로, 그때 여기에 붙인다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: false,
    },
  },
});
