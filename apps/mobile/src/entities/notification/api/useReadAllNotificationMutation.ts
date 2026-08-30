import { useApiMutation } from '../../../shared/lib/queries/useApiMutation';

import { notificationQueries } from './notification.queries';
import { notificationReadAllPatchFetch } from './notificationReadAllPatchFetch';

/**
 * 알림 전체 읽음 처리
 * - 성공 시 알림 목록 갱신
 */
export const useReadAllNotificationMutation = () =>
  useApiMutation({
    fetcher: () => notificationReadAllPatchFetch(),
    invalidateKey: notificationQueries.root(),
  });
