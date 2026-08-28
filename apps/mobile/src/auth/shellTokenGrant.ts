import { BRIDGE_ERROR_CODES } from '@onsquad/bridge';
import { NativeBridgeError } from '@onsquad/bridge/native';

import { refreshSession } from '../shared/lib/auth/sessionRefresh';

import { getShellAccessToken } from './session';

/**
 * 웹뷰가 쓸 액세스 토큰을 내주는 곳. 브릿지 `auth.getToken` 의 알맹이다.
 *
 * 웹뷰는 자기 토큰이 만료됐는지 스스로 알지 못한다 — 401 을 받고 나서야 안다.
 * 그때 웹은 `auth.getToken` 을 **다시** 부른다. 계약상 인자가 없으니(`req: void`)
 * "처음 물어보는 것"과 "만료돼서 다시 물어보는 것"을 구분할 단서는 하나뿐이다:
 * **방금 건넨 토큰을 또 물어보면, 그 토큰이 401 을 맞았다는 뜻이다.**
 *
 * 그래서 마지막으로 건넨 토큰을 기억해 두고, 같은 값을 다시 요구받으면
 * 셸의 갱신(`refreshSession` → `/auth/reissue`)을 태워 **새 토큰**을 내준다.
 * 같은 토큰을 그대로 돌려주면 웹의 재시도가 같은 401 을 다시 맞아, 갱신이 있으나 마나다.
 *
 * 갱신까지 실패하면 던진다 — 브릿지가 실패 응답으로 바꿔 웹에 전달하고,
 * 웹은 갱신을 포기해 만료 응답이 상위로 흘러 로그아웃된다.
 * (`installSessionRefresh` 가 이미 세션을 정리하고 `onSessionLost` 를 부른 뒤다)
 */

/**
 * 웹뷰에 마지막으로 건넨 액세스 토큰 — **화면(웹뷰) 하나당 하나**다.
 *
 * 전역으로 하나만 두면 화면이 여러 개 열릴 때 오판한다: 화면마다 새 WebView 가 뜨고
 * 각자 초기 1회 `auth.getToken` 을 부르는데, 두 번째 화면의 **정상** 요청이
 * "같은 토큰을 또 물었다 = 만료" 로 읽혀 갱신이 돈다.
 * 실제로 공지 목록→상세로 들어간 두 번째 웹뷰가 그 경로를 타 401 을 맞았다(실측).
 */
let lastGrantedToken: string | undefined;

/**
 * 실제 만료 시각을 추적하지 않아 30분 뒤를 준다.
 * 웹은 이 값을 참고용으로만 쓴다 — 갱신의 실제 계기는 401 이다.
 */
const TOKEN_LIFETIME_MS = 30 * 60 * 1000;

/** 웹뷰 화면이 사라질 때 호출해 다음 화면이 남의 기록을 물려받지 않게 한다. */
export const resetShellTokenGrant = (): void => {
  lastGrantedToken = undefined;
};

export interface ShellTokenGrant {
  accessToken: string;
  expiresAt: number;
}

/**
 * 화면 하나가 쓸 발급기를 만든다. 기록이 이 안에 갇히므로 다른 화면과 섞이지 않는다.
 * "같은 토큰을 또 물었다"는 **그 화면 안에서만** 만료 신호로 읽힌다 — 그게 실제 의미다.
 */
export const createShellTokenGrant = () => {
  let lastGranted: string | undefined;

  return async (): Promise<ShellTokenGrant> => {
    const current = getShellAccessToken();

    if (current !== undefined && current !== lastGranted) {
      lastGranted = current;

      return { accessToken: current, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
    }

    const refreshed = await refreshSession();
    const renewed = getShellAccessToken();

    if (!refreshed || renewed === undefined) {
      lastGranted = undefined;

      throw new NativeBridgeError(BRIDGE_ERROR_CODES.INTERNAL, '세션이 만료되어 다시 로그인해야 해요.');
    }

    lastGranted = renewed;

    return { accessToken: renewed, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
  };
};

/** @deprecated 화면 단위 기록을 쓰는 {@link createShellTokenGrant} 를 쓴다. */
export const grantShellAccessToken = async (): Promise<ShellTokenGrant> => {
  const current = getShellAccessToken();

  // 처음 묻는 토큰이면 그대로 건넨다. 아직 만료됐다는 신호가 없다.
  if (current !== undefined && current !== lastGrantedToken) {
    lastGrantedToken = current;

    return { accessToken: current, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
  }

  const refreshed = await refreshSession();
  const renewed = getShellAccessToken();

  if (!refreshed || renewed === undefined) {
    lastGrantedToken = undefined;

    throw new NativeBridgeError(BRIDGE_ERROR_CODES.INTERNAL, '세션이 만료되어 다시 로그인해야 해요.');
  }

  lastGrantedToken = renewed;

  return { accessToken: renewed, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
};
