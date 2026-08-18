import { View } from 'react-native';

import { Plus } from 'lucide-react-native';

import type { CrewHomeData } from '@/entities/crew';

import { Avatar } from '../../../../shared/ui/Avatar';
import { Badge } from '../../../../shared/ui/Badge';
import { Card } from '../../../../shared/ui/Card';
import { PostButton } from '../../../../shared/ui/PostButton';
import { Text } from '../../../../shared/ui/Text';

interface CrewSquadListProps {
  squads?: CrewHomeData['squads'];
}

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외). primary500 과 같은 값이다.
const PLUS_COLOR = '#FF7800';

const PLUS_SIZE = 10;

/** 카테고리는 앞의 2개만 보여준다 — 웹과 같다. */
const VISIBLE_CATEGORY_COUNT = 2;

/**
 * 웹 `features/crew/home/ui/CrewSquadList` 의 RN 미러.
 *
 * **Phase 3 의 `Card` 가 여기서 첫 소비자를 얻는다** — 4a 스펙 §2.3 이 적어둔 공백이 닫힌다.
 *
 * "스쿼드 모집하기" 와 카드 탭은 모양만 둔다 — 스쿼드 화면은 4e 다.
 * 웹은 `crewId` 를 받아 개설 화면으로 넘기지만 갈 곳이 없으므로 받지 않는다.
 */
export function CrewSquadList({ squads }: CrewSquadListProps) {
  return (
    <View className="w-full">
      <View className="mb-3 flex-row items-center justify-between">
        <Text.lg className="font-bold">모집중인 스쿼드</Text.lg>

        <PostButton className="border border-primary500">
          <Text.xxs className="ml-1 font-bold">스쿼드 모집하기</Text.xxs>
          <Plus size={PLUS_SIZE} color={PLUS_COLOR} />
        </PostButton>
      </View>

      <View className="flex-col gap-3 pb-10">
        {squads?.map((squad) => (
          <Card
            key={squad.id}
            title={
              <View className="flex-row items-center justify-between">
                <Text.sm className="py-3 font-bold">{squad.title}</Text.sm>
                <View className="flex-row items-center gap-2">
                  {squad.categories.slice(0, VISIBLE_CATEGORY_COUNT).map((category) => (
                    <Badge key={category}>{category}</Badge>
                  ))}
                  <Badge>
                    {squad.capacity - squad.remain}/{squad.capacity} 명
                  </Badge>
                </View>
              </View>
            }
          >
            <View className="flex-row gap-1">
              <Avatar className="h-4 w-4" />
              <Text.xs className="font-medium">{squad.leader.nickname}</Text.xs>
            </View>
            <View className="mt-2">
              <Text.xs className="font-medium" numberOfLines={4}>
                {squad.content}
              </Text.xs>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}
