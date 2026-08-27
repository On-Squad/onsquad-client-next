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
export function WebViewAuth() {
  useEffect(() => {
    if (!isWebView()) return;

    // 웹뷰에서 RN 네이티브 헤더가 앱바를 대신하므로 --app-header-height 오프셋을 0 으로 덮는다.
    document.documentElement.style.setProperty('--app-header-height', '0px');

    if (!can('auth.getToken')) return;

    // BFF(/api/bff) 는 브라우저 세션 쿠키 기반이라 웹뷰에선 동작하지 않는다.
    // 직접 API 호출 + 셸 토큰 주입 방식으로 전환한다.
    setBrowserRuntime(false);

    // 초기 토큰 주입.
    call('auth.getToken', undefined)
      .then(({ accessToken }) => {
        setAccessTokenProvider(() => accessToken);
      })
      .catch(() => {
        // 토큰 조회 실패 시 인증 없이 진행 — 서버가 401 을 내주면 자연스럽게 처리된다.
      });

    // 401 을 받으면 RN 에서 새 토큰을 받아 원요청을 재시도한다.
    // next-auth session.update 는 쿠키 세션 기반이라 웹뷰에서 동작하지 않는다.
    // session-provider 의 SessionRefreshBridge 는 isWebView() 게이트로 등록을 건너뛴다.
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

    return () => {
      // 화면 이탈 시 원복 — 다른 화면이 영향받지 않도록.
      document.documentElement.style.removeProperty('--app-header-height');
      setBrowserRuntime(null);
      setAccessTokenProvider(() => undefined);
      registerSessionRefresh(null);
    };
  }, []);

  return null;
}
