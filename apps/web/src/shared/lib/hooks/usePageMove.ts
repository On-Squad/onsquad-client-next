'use client';

import { useCallback } from 'react';

import { useTransitionRouter } from 'next-view-transitions';
import { can } from '@onsquad/bridge/web';

import { shellPush, shellReplace } from '../bridge/shell';
import { markIntentionalBack, setNavDirection } from '../utils/navDirection';

export const usePageMove = () => {
  const router = useTransitionRouter();

  const handlePageMove = useCallback(
    (path: string, options?: { scroll: boolean }) => {
      setNavDirection('forward');
      // 앱 웹뷰에서는 router.push 가 아니라 shell.push 로 네이티브 스택을 쌓는다.
      // 브릿지 없는 브라우저에서는 can() 이 false 를 반환해 기존 라우터 경로가 그대로 동작한다.
      if (can('shell.push')) {
        shellPush(path);
        return;
      }
      router.push(path, { scroll: options?.scroll ?? false });
    },
    [router],
  );

  const handleReplace = useCallback(
    (path: string, options?: { scroll: boolean }) => {
      setNavDirection('forward');
      // 앱 웹뷰에서는 router.replace 가 아니라 shell.replace 로 현재 화면을 교체한다.
      // 브릿지 없는 브라우저에서는 can() 이 false 를 반환해 기존 라우터 경로가 그대로 동작한다.
      if (can('shell.replace')) {
        shellReplace(path);
        return;
      }
      router.replace(path, { scroll: options?.scroll ?? false });
    },
    [router],
  );

  // 의도적 뒤로가기: 뷰트랜지션(슬라이드)을 유지한다. window(네이티브 제스처) 뒤로가기와 구분하기 위해
  // 플래그를 세팅한 뒤 popstate 를 유발한다. (핸들러가 소비해 'back' 애니메이션으로 처리)
  const handleBack = useCallback(() => {
    markIntentionalBack();
    router.back();
  }, [router]);

  return { handlePageMove, handleReplace, handleBack };
};
