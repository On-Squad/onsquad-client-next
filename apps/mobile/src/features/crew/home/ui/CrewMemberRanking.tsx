import { View } from 'react-native';

import type { CrewHomeData } from '@/entities/crew';

import { Article } from '../../../../shared/ui/Article';
import { Avatar } from '../../../../shared/ui/Avatar';
import { Text } from '../../../../shared/ui/Text';

interface CrewMemberRankingProps {
  members?: CrewHomeData['rankers'];
}

/**
 * 웹 `features/crew/home/ui/CrewMemberRanking` 의 RN 미러.
 *
 * 응답의 `score` · `lastActivityTime` 은 **웹과 마찬가지로 쓰지 않는다.**
 * 이관은 모양을 옮기는 것이지 기능을 늘리는 것이 아니다.
 *
 * "랭킹 더보기" 는 모양만 둔다 — 갈 화면이 아직 없다.
 */
export function CrewMemberRanking({ members }: CrewMemberRankingProps) {
  return (
    <Article
      className="min-h-[280px] w-full p-3"
      slot={
        <>
          <View className="flex-row items-center justify-between">
            <Text.lg className="font-semibold">크루원 활동 랭킹</Text.lg>
            <Text.xs className="text-grayscale500">랭킹 더보기</Text.xs>
          </View>

          <View className="mt-6">
            {members && members.length > 0 ? (
              members.map((member, index) => (
                <View
                  key={member.memberId}
                  className={
                    index === 0
                      ? 'flex-row items-center gap-3 py-2'
                      : 'flex-row items-center gap-3 border-t border-grayscale200 py-2'
                  }
                >
                  <Text.xs className="font-bold">{member.rank}위</Text.xs>
                  <View className="flex-row items-center gap-0.5">
                    <Avatar className="mr-1 h-5 w-5" />
                    <Text.base className="font-semibold">{member.nickname}</Text.base>
                  </View>
                </View>
              ))
            ) : (
              <Text.lg>등록된 크루원이 없어요.</Text.lg>
            )}
          </View>
        </>
      }
    />
  );
}
