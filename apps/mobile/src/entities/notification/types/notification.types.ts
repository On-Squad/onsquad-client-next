/**
 * 알림 detail 타입. (백엔드 NotificationDetail enum)
 * - CONNECT/HEARTBEAT 은 SSE 인프라 이벤트로 목록에 오지 않는다.
 * - 나머지 8 케이스는 사용자에게 표시된다.
 */
export const NOTIFICATION_DETAIL = {
  CONNECT: 'CONNECT',
  HEARTBEAT: 'HEARTBEAT',
  CREW_REQUEST: 'CREW_REQUEST',
  CREW_ACCEPT: 'CREW_ACCEPT',
  CREW_REJECT: 'CREW_REJECT',
  SQUAD_REQUEST: 'SQUAD_REQUEST',
  SQUAD_ACCEPT: 'SQUAD_ACCEPT',
  SQUAD_REJECT: 'SQUAD_REJECT',
  COMMENT: 'COMMENT',
  COMMENT_REPLY: 'COMMENT_REPLY',
} as const;

export type NotificationDetail =
  | 'CONNECT'
  | 'HEARTBEAT'
  | 'CREW_REQUEST'
  | 'CREW_ACCEPT'
  | 'CREW_REJECT'
  | 'SQUAD_REQUEST'
  | 'SQUAD_ACCEPT'
  | 'SQUAD_REJECT'
  | 'COMMENT'
  | 'COMMENT_REPLY';

export type NotificationTopic = 'USER';

/**
 * 알림 payload. (백엔드 detail 별 payload record)
 * - 모든 사용자 알림(8 케이스)은 서버가 포맷 완료한 표시 문구 `message` 를 포함한다.
 * - CREW_xx/COMMENT_xx 는 crewId/crewName 을 포함한다.
 * - SQUAD_xx/COMMENT_xx 는 squadId/squadTitle 도 갖지만 이동할 화면이 없어 지금은 쓰지 않는다.
 */
export interface NotificationPayload {
  message?: string;
  crewId?: number;
  crewName?: string;
  squadId?: number;
  squadTitle?: string;
  requestId?: number;
  commentId?: number;
  parentId?: number;
  replyId?: number;
}

/**
 * 회원 알림 목록 API 항목. (GET /api/members/me/notifications)
 */
export interface NotificationListItem {
  id: number;
  topic: NotificationTopic;
  detail: NotificationDetail | string;
  publisherId?: number;
  receiverId?: number;
  occurredAt: string;
  read: boolean;
  payload?: NotificationPayload;
}
