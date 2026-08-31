import type { CrewMemberItem } from '../../../../../entities/crew/api/crewMembersGetFetch';

type MemberStates = CrewMemberItem['states'];

/**
 * ⋮ 버튼을 표시할지 여부.
 *
 * - 자기 자신(isMe)에게는 표시하지 않는다.
 * - canKick, canDelegateOwner 둘 다 false 이면 메뉴 항목이 없으므로 표시하지 않는다.
 * - 표시 여부는 서버가 판정한 states 만으로 결정한다 — 화면이 역할 규칙을 재계산하지 않는다.
 */
export const canShowMemberMenu = (states: MemberStates): boolean =>
  !states.isMe && (states.canKick || states.canDelegateOwner);

/** 메뉴에 표시할 항목 목록. 순서: 크루장 위임 → 강퇴 (웹과 동일). */
export const memberMenuItems = (
  states: MemberStates,
): Array<'크루장 위임' | '강퇴'> => {
  const items: Array<'크루장 위임' | '강퇴'> = [];
  if (states.canDelegateOwner) items.push('크루장 위임');
  if (states.canKick) items.push('강퇴');
  return items;
};
