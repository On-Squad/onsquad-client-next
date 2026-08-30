'use client';

import { useQuery } from '@tanstack/react-query';

import { notificationQueries } from './notification.queries';

/**
 * 벨 배지 안읽음 개수. 최근 20건 기준 근사치다.
 * @param enabled 로그인 상태에서만 조회한다
 */
export function useUnreadBadgeCount(enabled: boolean): number {
  const { data = 0 } = useQuery({ ...notificationQueries.badge(), enabled });
  return data;
}
