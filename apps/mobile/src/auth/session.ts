import { setAccessTokenProvider } from '../shared/api/accessTokenProvider';

/**
 * 셸이 세션을 쥔다.
 *
 * 화면 코드는 이 파일을 모른다 — `useAuth` 만 본다.
 * 저장소가 바뀌든 갱신 방식이 바뀌든 여기와 `authService` 안에서 끝난다.
 * 웹뷰에 넘길 때는 브릿지 `auth.getToken` 으로 수명 짧은 토큰만 준다.
 */
let accessToken: string | undefined;

/**
 * refreshToken 도 메모리에 쥔다.
 * 갱신은 저장소를 다시 읽지 않고 여기서 꺼내 쓴다 — Keychain 왕복은 느리고,
 * 만료는 여러 요청이 동시에 겪을 수 있다.
 */
let refreshToken: string | undefined;

export const setShellAccessToken = (token: string | undefined) => {
  accessToken = token;
};

export const setShellRefreshToken = (token: string | undefined) => {
  refreshToken = token;
};

export const getShellRefreshToken = () => refreshToken;

export const clearShellSession = () => {
  accessToken = undefined;
  refreshToken = undefined;
};

/**
 * api 레이어에 토큰 공급자를 등록한다.
 * **첫 요청보다 먼저 불려야 하므로 `index.js` 가 모듈 로드 시점에 호출한다.**
 * 시그니처를 바꾸지 마라.
 */
export const initShellSession = () => {
  setAccessTokenProvider(() => accessToken);
};
