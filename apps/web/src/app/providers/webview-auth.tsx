'use client';

import { useEffect } from 'react';

import { call, can, isWebView } from '@/shared/lib/bridge';
import { setAccessTokenProvider } from '@/shared/api/accessTokenProvider';
import { setBrowserRuntime } from '@/shared/api/runtime';
import { registerSessionRefresh } from '@/shared/lib/auth/sessionRefresh';

/**
 * 웹뷰에서 auth.getToken 으로 인증을 설정한다.
 *
 * - 브라우저: isWebView() === false → 아무것도 하지 않는다. 기존 BFF 세션 경로 유지.
 * - 웹뷰: can('auth.getToken') === true → 셸에서 토큰을 받아 API 클라이언트에 주입.
 *   setBrowserRuntime(false) 로 BFF 경유를 끄고 백엔드 직접 요청으로 전환한다.
 *   --app-header-height 를 0 으로 재정의해 RN 헤더 위에 웹 헤더 오프셋이 겹치지 않게 한다.
 *
 * 브라우저 사용자의 동작은 한 줄도 달라지지 않는다 — isWebView() 게이트가 막는다.
 *
 * 토큰 갱신:
 * session-provider 의 next-auth 기반 갱신은 브라우저 전용이다(쿠키 세션이 없는 웹뷰에선 실패).
 * 웹뷰에서는 auth.getToken 으로 RN 에서 직접 새 토큰을 받아 재시도한다.
 * 갱신 실패 시 만료 응답이 상위로 올라가 로그아웃이 트리거된다.
 */
/**
 * **모듈이 평가되는 순간 토큰 요청을 걸어둔다.**
 *
 * 등록을 `useEffect` 안에서만 하면 늦는다 — React 는 자식의 effect 를 먼저 돌리므로
 * 화면의 첫 쿼리가 이 컴포넌트보다 앞서 나가고, 그 요청은 토큰 없이 401 을 맞는다.
 * 공지 상세가 작성자·본문 없이 "작성된 내용이 없습니다"로 보이던 원인이 이것이었다(실측).
 *
 * 그래서 **약속(Promise)만 먼저 등록**한다. provider 는 Promise 를 돌려줄 수 있고
 * `common.ts` 가 그것을 기다리므로, 첫 요청도 토큰이 실린 채로 나간다.
 * 브라우저에서는 `isWebView()` 가 false 라 이 블록이 통째로 건너뛰어진다.
 */
// 모듈이 평가되는 순간 한 번 실행된다. 반환값을 쓰는 곳은 없다 — 등록 자체가 목적이다.
(() => {
  if (typeof window === 'undefined' || !isWebView() || !can('auth.getToken')) return;

  setBrowserRuntime(false);

  const pending = call('auth.getToken', undefined)
    .then(({ accessToken }) => accessToken)
    .catch(() => undefined);

  setAccessTokenProvider(() => pending);

  // **갱신 함수도 여기서 등록한다.** effect 안에서만 등록하면 화면의 첫 쿼리보다 늦어,
  // 그 요청이 토큰 없이 나가 T004 를 맞아도 되돌릴 방법이 없다(실측).
  // 토큰을 다시 물으면 셸이 만료로 보고 갱신해 새 토큰을 준다.
  registerSessionRefresh(async () => {
    try {
      const { accessToken } = await call('auth.getToken', undefined);

      setAccessTokenProvider(() => accessToken);

      return true;
    } catch {
      // 갱신 실패 → common.ts 가 재시도하지 않고 만료 응답을 흘려보냄 → QueryCache 에서 로그아웃.
      return false;
    }
  });
})();

export function WebViewAuth() {
  useEffect(() => {
    if (!isWebView()) return;

    // 웹뷰에서 RN 네이티브 헤더가 앱바를 대신하므로 --app-header-height 오프셋을 0 으로 덮는다.
    document.documentElement.style.setProperty('--app-header-height', '0px');

    // 토큰 주입과 갱신 등록은 모듈 평가 시점에 이미 끝났다(위 grantedToken).
    // 여기서는 웹뷰에서만 필요한 레이아웃 보정만 한다.

    // **정리(cleanup)를 두지 않는다.**
    // 등록은 모듈 평가 시점에 한 번만 일어나므로, 언마운트 때 지우면 다시 등록될 길이 없다.
    // 실제로 하이드레이션 불일치로 트리가 한 번 버려졌을 때 이 정리가 돌아
    // 웹뷰 인증이 통째로 사라졌다(실측 — 공지 상세가 401 을 맞던 원인).
    // 이 provider 는 앱과 수명을 같이하므로 되돌릴 필요도 없다.
  }, []);

  return null;
}
