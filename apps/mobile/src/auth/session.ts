import { setAccessTokenProvider } from '@/shared/api/accessTokenProvider';

/**
 * 셸이 세션을 쥔다.
 *
 * 지금은 토큰이 없다 — 로컬 백엔드는 크루 조회를 미인증으로 허용한다.
 * 네이티브 로그인·보안 저장소·갱신이 붙어도 **이 파일 안만** 바뀌고 화면 코드는 그대로다.
 * 웹뷰에 넘길 때는 브릿지 `auth.getToken` 으로 수명 짧은 토큰만 준다.
 */
let accessToken: string | undefined;

export const setShellAccessToken = (token: string | undefined) => {
  accessToken = token;
};

export const initShellSession = () => {
  setAccessTokenProvider(() => accessToken);
};
