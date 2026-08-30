import { apiFetch } from '../../../shared/api/common';
import type { ResponseModel } from '../../../shared/api/model';
import type { NotificationListItem } from '../types/notification.types';

export interface NotificationListGetFetchParams {
  page?: number;
  size?: number;
}

export interface NotificationListGetFetchResponse extends ResponseModel {
  data: {
    size: number;
    page: number;
    totalPages: number;
    totalCount: number;
    resultsSize: number;
    results: NotificationListItem[];
  };
}

/**
 * 내 알림 목록 조회
 * - GET /api/members/me/notifications
 */
export const notificationListGetFetch = ({ page, size }: NotificationListGetFetchParams = {}) => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (size !== undefined) params.append('size', String(size));
  const query = params.toString();

  return apiFetch.get<NotificationListGetFetchResponse>(
    `/members/me/notifications${query ? `?${query}` : ''}`,
  );
};
