'use client';

import React, { useEffect } from 'react';

import { SessionProvider as NextAuthSessionProvider, useSession } from 'next-auth/react';

import { isWebView } from '@/shared/lib/bridge';

import { registerSessionRefresh } from '@/shared/lib/auth/sessionRefresh';

/**
 * 토큰 만료 시 fetch 레이어(common.ts)가 호출할 수 있도록, useSession().update 기반
 * refresh 함수를 single-flight 브리지에 등록한다. update({ type: 'token-refresh' }) 가
 * jwt 콜백의 재발급을 트리거하고 next-auth 가 세션 쿠키를 네이티브로 영속화한다.
 *
 * 웹뷰에서는 쿠키 세션이 없으므로 next-auth 방식이 동작하지 않는다.
 * WebViewAuth 가 auth.getToken 브릿지 기반 갱신을 등록하며, 이 등록이 우선해야 한다.
 * isWebView() 게이트가 next-auth 갱신을 건너뛰어 WebViewAuth 의 등록을 보존한다.
 */
const SessionRefreshBridge = () => {
  const { update } = useSession();

  useEffect(() => {
    // 웹뷰에서는 WebViewAuth 가 bridge 기반 갱신을 등록한다 — next-auth 방식이 덮지 않게 한다.
    if (isWebView()) return;

    registerSessionRefresh(async () => {
      const updated = await update({ type: 'token-refresh' });

      return !!updated && !updated.error;
    });

    return () => registerSessionRefresh(null);
  }, [update]);

  return null;
};

const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextAuthSessionProvider refetchOnWindowFocus={false}>
      <SessionRefreshBridge />
      {children}
    </NextAuthSessionProvider>
  );
};

export default SessionProvider;
