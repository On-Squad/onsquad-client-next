import { apiFetch } from '../../../shared/api/common';
import type { ResponseModel } from '../../../shared/api/model';

/**
 * 알림 단건 읽음 처리
 * - PATCH /api/notifications/{notificationId}/read
 */
export const notificationReadPatchFetch = ({ notificationId }: { notificationId: number }) =>
  apiFetch.patch<ResponseModel>(`/notifications/${notificationId}/read`);
