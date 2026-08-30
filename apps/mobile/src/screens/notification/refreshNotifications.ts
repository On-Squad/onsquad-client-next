import type { QueryClient } from '@tanstack/react-query';

import { notificationQueries } from '../../entities/notification';

/**
 * 알림 목록을 다시 받게 한다.
 *
 * **알림 쿼리만 무효화한다.** 상위 키(`['notification']`)로 좁게 잡아도
 * 크루·스쿼드 쿼리는 키 구조가 달라 딸려 재조회되지 않는다.
 * `infiniteList` 와 `badge` 를 함께 무효화해 목록과 벨 배지가 동시에 갱신된다.
 */
export const refreshNotifications = ({ queryClient }: { queryClient: QueryClient }) =>
  queryClient.invalidateQueries({ queryKey: notificationQueries.root() });
