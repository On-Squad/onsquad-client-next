import type { RootStackParamList } from './types';

/** 크루 관리 허브의 줄 식별자. */
export type ManageHubRow = 'crewInfo' | 'participants' | 'squad' | 'crewMembers' | 'crewDelete';

/** 줄을 눌렀을 때 이동할 화면과 파라미터. null 이면 아직 이관하지 않아 비활성인 줄이다. */
export type ManageRowTarget =
  | { screen: 'CrewMembers'; params: RootStackParamList['CrewMembers'] }
  | { screen: 'CrewParticipants'; params: RootStackParamList['CrewParticipants'] }
  | null;

/**
 * 크루 관리 허브의 줄을 눌렀을 때 이동할 화면을 순수하게 계산한다.
 *
 * 활성 줄: 크루원(crewMembers) · 참가 신청(participants).
 * 비활성 줄: 크루정보 수정(crewInfo) · 스쿼드(squad) · 크루 삭제(crewDelete) — null 을 돌려준다.
 */
export function resolveManageRow(
  row: ManageHubRow,
  params: { crewId: number; crewName: string },
): ManageRowTarget {
  if (row === 'crewMembers') return { screen: 'CrewMembers', params };
  if (row === 'participants') return { screen: 'CrewParticipants', params };
  return null;
}
