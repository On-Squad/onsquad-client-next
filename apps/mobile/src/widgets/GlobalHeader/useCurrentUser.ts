import { useQuery } from '@tanstack/react-query';

import { userInfoGetFetch } from '@/entities/auth/api/userInfoGetFetch';

/**
 * 로그인한 사용자 정보.
 *
 * 웹은 next-auth 세션(`useUser`)에서 꺼내지만 RN 에는 세션 개념이 없다.
 * 대신 셸이 쥔 토큰으로 `/members/me` 를 직접 부른다 — 웹이 로그인 시 세션에 채우는 것과 같은 API 다.
 *
 * `enabled` 로 비로그인 상태의 호출을 막는다. 막지 않으면 만료 판정이 돌아 로그아웃 처리가 된다.
 */
export const useCurrentUser = (isAuthenticated: boolean) => {
  const { data } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => userInfoGetFetch({}),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return data?.data.data;
};
