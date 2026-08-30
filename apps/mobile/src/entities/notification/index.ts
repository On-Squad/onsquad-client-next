export type {
  NotificationDetail,
  NotificationListItem,
  NotificationPayload,
  NotificationTopic,
} from './types/notification.types';
export { NOTIFICATION_DETAIL } from './types/notification.types';

export { notificationQueries } from './api/notification.queries';
export { useReadNotificationMutation } from './api/useReadNotificationMutation';
export { useReadAllNotificationMutation } from './api/useReadAllNotificationMutation';
export { useUnreadBadgeCount } from './api/useUnreadBadgeCount';

export { formatNotificationDate } from './lib/formatNotificationDate';
export { formatUnreadBadge } from './lib/formatUnreadBadge';
export { groupNotificationsByDate } from './lib/groupNotificationsByDate';
export type { NotificationSection } from './lib/groupNotificationsByDate';
