import { MoreVertical } from 'lucide-react';

import type { CrewMemberItem } from '@/entities/crew/api/manage/members';

import { Avatar } from '@/shared/ui/Avatar';
import { Text } from '@/shared/ui/Text';

interface CrewMemberCardProps {
  item: CrewMemberItem;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
}

/**
 * 크루원 한 명.
 *
 * **카드 전체가 프로필로 가는 버튼이다.** RN 도 같다.
 * 처음엔 소개 줄 오른쪽에 `>` 를 두고 그 줄만 눌리게 했는데,
 * 화살표 없이 카드를 누르는 편이 손가락으로 쓰기 쉬워 양쪽 다 이렇게 바꿨다.
 *
 * `⋮` 는 카드 버튼 안에 중첩할 수 없어(button 안의 button) 형제로 두고,
 * 카드 버튼은 그 옆 영역만 덮는다.
 */
const CrewMemberCard = ({ item, onOpenMenu, onOpenProfile }: CrewMemberCardProps) => {
  const { states, member } = item;
  const canManage = !states.isMe && (states.canKick || states.canDelegateOwner);

  return (
    <li className="relative flex flex-col gap-2 rounded-xl bg-white p-3">
      <button type="button" className="flex flex-col gap-2 text-left" onClick={onOpenProfile}>
        <div className="flex items-center gap-2">
          <Avatar className="size-6 shrink-0" />
          <Text.sm className="font-medium tracking-tight text-grayscale900">{member.nickname}</Text.sm>
        </div>
        <Text.sm className="tracking-tight text-grayscale900">{member.introduce}</Text.sm>
      </button>

      {canManage && (
        <button
          type="button"
          aria-label={`${member.nickname} 님 관리`}
          className="absolute right-3 top-3"
          onClick={onOpenMenu}
        >
          <MoreVertical className="size-5 text-grayscale500" />
        </button>
      )}
    </li>
  );
};

export default CrewMemberCard;
