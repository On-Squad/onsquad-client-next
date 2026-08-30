import type { NotificationListItem } from '../types/notification.types';
import { formatNotificationDate } from './formatNotificationDate';

export interface NotificationSection {
  title: string;
  data: NotificationListItem[];
}

/**
 * occurredAt 날짜(YYYY.MM.DD) 기준으로 알림 목록을 묶어 SectionList 섹션 배열로 반환한다.
 * 입력 순서(최신순)를 유지한다.
 */
export const groupNotificationsByDate = (list: NotificationListItem[]): NotificationSection[] => {
  const groups = new Map<string, NotificationListItem[]>();

  list.forEach((item) => {
    const date = formatNotificationDate(item.occurredAt);
    const bucket = groups.get(date);

    if (bucket) {
      bucket.push(item);
    } else {
      groups.set(date, [item]);
    }
  });

  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
};
