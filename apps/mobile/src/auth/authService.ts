import { userLoginPostFetch } from '../entities/auth/api/userLoginPostFetch';
import { tokenRefreshGetFetch } from '../shared/api/auth/tokenRefreshGetFetch';
import { registerSessionRefresh } from '../shared/lib/auth/sessionRefresh';

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
 * 로그인. 실패하면 던진다 — 화면이 그 문구를 토스트로 보여준다.
 *
 * **로그인 실패도 HTTP 200 으로 온다.** 그래서 `ApiClient` 의 `!response.ok` 분기에
 * 걸리지 않고, 봉투만 `{ success: false, error }` 이고 `data` 가 없다.
 * 여기서 승격시키지 않으면 바로 아래 구조분해가 TypeError 를 내고
 * 그 영문 메시지가 그대로 사용자에게 보인다(실측).
 */
export const login = async ({ email, password }: { email: string; password: string }): Promise<void> => {
  const response = await userLoginPostFetch({ email, password });

  const { data, error } = response.data;

  if (error || !data) {
    throw new Error(error?.message ?? '로그인에 실패했어요.');
  }

  await applyTokens(data.accessToken, data.refreshToken);
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

      // **재발급 실패도 HTTP 200 으로 온다.** 봉투만 `{ success: false, error }` 이고
      // `data` 가 없다 — `login` 과 같은 모양이다. 확인하지 않으면 바로 아래 접근이
      // TypeError 를 내고, 그게 우연히 catch 에 걸려 로그아웃되는 구조가 된다.
      // 실패한 봉투의 `data` 는 신뢰하지 않는다(있어도 쓰지 않는다).
      const { data, error } = response.data;

      if (error || !data) {
        throw new Error(error?.message ?? '세션을 갱신하지 못했어요.');
      }

      await applyTokens(data.accessToken, data.refreshToken);

      return true;
    } catch {
      await clearSession();
      onSessionLost();

      return false;
    }
  });
};
