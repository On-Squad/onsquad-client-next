import type { Mbti } from '@/shared/api/model';

export type CrewRole = 'OWNER' | 'GENERAL' | 'MANAGER';
export type SquadRole = 'OWNER' | 'LEADER';

/**
 * 응답에 실려오는 유저 요약.
 * squad 와 member 두 도메인이 함께 쓰므로 여기 둔다 — 한쪽 entities 에 두면 형제 슬라이스 참조가 된다.
 */
export interface SquadUserInfo {
  /** 유저 pk */
  id: number;
  /** 닉네임 */
  nickname: string;
  /** 자기소개 */
  introduce: string;
  /** mbti */
  mbti: Mbti | '';
}
