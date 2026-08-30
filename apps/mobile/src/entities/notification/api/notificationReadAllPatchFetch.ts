import { apiFetch } from '../../../shared/api/common';
import type { ResponseModel } from '../../../shared/api/model';

/**
 * 알림 전체 읽음 처리
 * - PATCH /api/notifications/read-all
 */
export const notificationReadAllPatchFetch = () =>
  apiFetch.patch<ResponseModel>('/notifications/read-all');
