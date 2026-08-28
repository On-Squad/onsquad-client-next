'use client';

import { useSyncExternalStore } from 'react';

import { useQuery } from '@tanstack/react-query';

import { crewQueries } from '@/entities/crew';

import { isWebView } from '@/shared/lib/bridge';
import { Appbar } from '@/shared/ui/Appbar';

/**
 * 웹뷰 여부는 `window` 에 의존하므로 서버에서는 알 수 없다.
 * 렌더 중에 그냥 `isWebView()` 를 부르면 서버는 앱바를 그리고 클라이언트는 안 그려서
 * **하이드레이션 불일치**가 난다(실측). React 가 트리를 버리고 다시 그리는데,
 * 그 과정에서 전역 provider 가 언마운트되며 웹뷰 인증이 함께 날아갔다.
 *
 * `useSyncExternalStore` 는 서버·하이드레이션 시점에 세 번째 인자(서버 스냅샷)를 쓰므로
 * 첫 렌더가 서버와 같아진다. 웹뷰라는 사실은 하이드레이션 직후 반영된다.
 */
const subscribeNever = () => () => {};

interface CrewDetailAppbarProps {
  crewId: number;
}

export const CrewDetailAppbar = ({ crewId }: CrewDetailAppbarProps) => {
  const { data: crewDetail } = useQuery({
    ...crewQueries.detail({ crewId }),
  });

  // 웹뷰에서는 RN 네이티브 헤더가 앱바 역할을 한다. 브라우저에서는 항상 false 라 기존 동작 그대로다.
  const inWebView = useSyncExternalStore(subscribeNever, isWebView, () => false);

  if (inWebView) return null;

  return <Appbar title={crewDetail?.data?.name} />;
};
