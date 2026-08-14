'use client';

import { useEffect } from 'react';

import { installGlobalErrorHandlers, observeStartup } from '@/shared/lib/observability';

/**
 * 전역 에러 수집과 시작 성능 계측을 켠다.
 *
 * 릴리즈 빌드 웹뷰는 원격 디버깅이 막혀 있어 "재현이 안 돼요"가 기본값이다.
 * 재현을 기대하지 말고 로그가 먼저 있어야 하므로, 트리 최상단에서 가장 먼저 켠다.
 */
export function ObservabilityProvider() {
  useEffect(() => {
    const uninstallErrors = installGlobalErrorHandlers();
    const stopStartup = observeStartup();

    return () => {
      uninstallErrors();
      stopStartup();
    };
  }, []);

  return null;
}
