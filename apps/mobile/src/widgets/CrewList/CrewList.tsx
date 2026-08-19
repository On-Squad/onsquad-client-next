import { Plus } from 'lucide-react-native';

import { CrewCard } from '../../entities/crew/ui/CrewCard';
import { Badge } from '../../shared/ui/Badge';
import { PostButton } from '../../shared/ui/PostButton';
import { Text } from '../../shared/ui/Text';
import { View } from 'react-native';

export interface CrewListItem {
  id: number;
  name: string;
  introduce: string;
  memberCount: number;
  imageUrl: string;
  hashtags: readonly unknown[];
  owner?: { nickname?: string };
}

interface CrewListHeaderProps {
  onAddCrewPress?: () => void;
}

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외). 웹 text-primary 와 같다.
const PLUS_COLOR = '#FF6A00';

const PLUS_SIZE = 12;

/**
 * 웹 `widgets/CrewList` 의 제목 줄.
 * "모집중인 크루" + 우측 "크루 개설하기" 버튼.
 */
export function CrewListHeader({ onAddCrewPress }: CrewListHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text.lg className="font-semibold">모집중인 크루</Text.lg>

      <PostButton onPress={onAddCrewPress}>
        <Text.xxs className="ml-1 font-bold text-primary">크루 개설하기</Text.xxs>
        <Plus size={PLUS_SIZE} color={PLUS_COLOR} />
      </PostButton>
    </View>
  );
}

interface CrewListCardProps {
  crew: CrewListItem;
  onPress: () => void;
}

/**
 * 웹 `widgets/CrewList` 가 `CrewCard` 에 넘기는 props 조립부.
 * 목록 화면 둘(홈·크루 탐색)이 같은 모양을 쓰도록 여기 모아둔다.
 */
export function CrewListCard({ crew, onPress }: CrewListCardProps) {
  return (
    <CrewCard
      crewImage={crew.imageUrl || ''}
      ownerName={crew.owner?.nickname || ''}
      title={crew.name}
      description={crew.introduce || ''}
      tagSlot={
        <>
          <Badge>멤버 수 {crew.memberCount} 명</Badge>
          {crew.hashtags.map((tag) => (
            <Badge key={String(tag)}>{String(tag)}</Badge>
          ))}
        </>
      }
      onPress={onPress}
    />
  );
}
