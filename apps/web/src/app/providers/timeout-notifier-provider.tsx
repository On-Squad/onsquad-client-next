'use client';

import { useEffect } from 'react';

import { setTimeoutNotifier } from '@/shared/api/timeoutNotifier';
import { showTimeoutToast } from '@/shared/lib/toast/showTimeoutToast';

/**
 * 요청 타임아웃을 웹에서 어떻게 알릴지 등록한다.
 *
 * `common.ts` 는 "타임아웃됐다"는 사실만 넘기고, 표시 방법은 여기서 정한다.
 * 그래야 데이터 레이어가 웹 토스트를 끌고 다니지 않는다.
 * (RN 은 같은 자리에 자기 구현을 등록한다)
 */
export function TimeoutNotifierProvider() {
  useEffect(() => {
    setTimeoutNotifier(showTimeoutToast);
  }, []);

  return null;
}
