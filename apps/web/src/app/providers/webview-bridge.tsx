'use client';

import { useEffect } from 'react';

import { install, shellReady } from '@/shared/lib/bridge';

/**
 * 브릿지 채널을 열고 RN 셸에 "웹 준비 완료"를 알린다.
 *
 * `install()` 이 먼저다 — 네이티브 → 웹 진입점(`window.__onNative`)이 없으면
 * 우리가 보낸 요청의 응답을 받을 곳이 없다.
 * 일반 브라우저에서는 둘 다 no-op 이다.
 */
export function WebViewBridge() {
  useEffect(() => {
    const uninstall = install();

    shellReady();

    return uninstall;
  }, []);

  return null;
}
