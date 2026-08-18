import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { isTokenExpiredError } from '../shared/lib/auth/isTokenExpiredError';

/**
 * 세션이 끊겼을 때 화면에 알리는 통로.
 *
 * 웹은 `signOut()` 으로 로그인 페이지에 리다이렉트하지만 RN 에는 전역 리다이렉트가 없다.
 * 화면을 강제로 튕기지 않고 상태만 내린다 — 다음에 인증이 필요한 지점에서 로그인 모달이 뜬다.
 */
let onSessionLost: () => void = () => {};

export const setSessionLostHandler = (handler: () => void) => {
  onSessionLost = handler;
};

/**
 * **갱신까지 실패한 만료만 여기 도달한다.**
 * `ApiClient` 가 갱신에 성공하면 원요청을 재시도하므로 에러가 올라오지 않는다.
 */
const handleExpiration = (error: unknown) => {
  if (!isTokenExpiredError(error)) {
    return;
  }

  onSessionLost();
};

/**
 * RN 전용 QueryClient.
 *
 * `apps/web` 의 `getQueryClient()` 를 재사용하지 않는다 — 그 안의 토큰 만료 처리가
 * `next-auth/react` 를 동적 import 하는데, **Metro 는 코드 스플리팅을 하지 않아
 * 동적 import 도 번들에 적재한다.** (타임아웃 토스트와 같은 병이다)
 *
 * 만료 처리를 캐시 레벨에 두는 이유는 웹과 같다 —
 * 어떤 에러 바운더리가 잡든(또는 `throwOnError: false` 로 안 잡든) 놓치지 않아야 한다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: false,
    },
  },
  queryCache: new QueryCache({ onError: handleExpiration }),
  mutationCache: new MutationCache({ onError: handleExpiration }),
});
