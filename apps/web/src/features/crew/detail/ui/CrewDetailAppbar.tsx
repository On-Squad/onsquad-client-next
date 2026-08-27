'use client';

import { useQuery } from '@tanstack/react-query';

import { crewQueries } from '@/entities/crew';

import { isWebView } from '@/shared/lib/bridge';
import { Appbar } from '@/shared/ui/Appbar';

interface CrewDetailAppbarProps {
  crewId: number;
}

export const CrewDetailAppbar = ({ crewId }: CrewDetailAppbarProps) => {
  const { data: crewDetail } = useQuery({
    ...crewQueries.detail({ crewId }),
  });

  // 웹뷰에서는 RN 네이티브 헤더가 앱바 역할을 한다.
  // 브라우저에서는 can() 이 false 라 이 분기에 들어오지 않는다 — 기존 동작 유지.
  if (isWebView()) return null;

  return <Appbar title={crewDetail?.data?.name} />;
};
