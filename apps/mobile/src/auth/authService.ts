import { userLoginPostFetch } from '@/entities/auth/api/userLoginPostFetch';
import { tokenRefreshGetFetch } from '@/shared/api/auth/tokenRefreshGetFetch';
import { registerSessionRefresh } from '@/shared/lib/auth/sessionRefresh';

import { clearShellSession, getShellRefreshToken, setShellAccessToken, setShellRefreshToken } from './session';
import { clearTokens, loadTokens, saveTokens } from './tokenStorage';

/**
 * 메모리와 저장소에 동시에 반영한다.
 * 둘이 어긋나면 재시작 후 동작이 달라져 재현하기 어려운 버그가 된다.
 */
const applyTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  setShellAccessToken(accessToken);
  setShellRefreshToken(refreshToken);

  await saveTokens({ accessToken, refreshToken });
};

const clearSession = async (): Promise<void> => {
  clearShellSession();

  await clearTokens();
};

/**
 * 로그인. 실패하면 던진다 — 화면이 문구를 보여준다.
 *
 * 백엔드는 모든 응답을 HTTP 200 으로 내리므로 `ApiClient` 가 body 를 보고 던진다.
 * 여기서 성공/실패를 다시 판정하지 않는다.
 */
export const login = async ({ email, password }: { email: string; password: string }): Promise<void> => {
  const response = await userLoginPostFetch({ email, password });

  const { accessToken, refreshToken } = response.data.data;

  await applyTokens(accessToken, refreshToken);
};

export const logout = async (): Promise<void> => {
  await clearSession();
};

/** 앱 시작 시 저장된 토큰을 메모리로 올린다. 없으면 false. */
export const restoreSession = async (): Promise<boolean> => {
  const tokens = await loadTokens();

  if (!tokens) {
    return false;
  }

  setShellAccessToken(tokens.accessToken);
  setShellRefreshToken(tokens.refreshToken);

  return true;
};

/**
 * 갱신 함수를 웹의 레지스트리에 꽂는다.
 *
 * `refreshSession()` 이 인-플라이트 중복 제거를 해주므로 동시에 여러 요청이 만료를 받아도
 * `/auth/reissue` 는 한 번만 나간다. 성공하면 `ApiClient` 가 원요청을 재시도한다.
 *
 * `tokenRefreshGetFetch` 는 비인증 인스턴스(`publicApiFetch`)를 쓴다 —
 * 만료된 토큰으로 갱신을 부르면 그것도 만료로 잡혀 무한루프가 된다.
 */
export const installSessionRefresh = (onSessionLost: () => void): void => {
  registerSessionRefresh(async () => {
    const refreshToken = getShellRefreshToken();

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await tokenRefreshGetFetch({ refreshToken });

      await applyTokens(response.data.data.accessToken, response.data.data.refreshToken);

      return true;
    } catch {
      await clearSession();
      onSessionLost();

      return false;
    }
  });
};
