import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSuspenseQuery } from '@tanstack/react-query';

import { crewQueries } from '../../entities/crew/api/crew.queries';

import { CrewHomeHeader } from '../../features/crew/home/ui/CrewHomeHeader';
import { CrewInfoPager } from '../../features/crew/home/ui/CrewInfoPager';
import { CrewMemberRanking } from '../../features/crew/home/ui/CrewMemberRanking';
import { CrewSquadList } from '../../features/crew/home/ui/CrewSquadList';
import type { RootStackParamList } from '../../navigation/types';

export type CrewHomeContentProps = NativeStackScreenProps<RootStackParamList, 'CrewHome'>;

/**
 * 웹 `features/crew/home/ui/CrewHome` + `pages/crews/home` 에 대응한다.
 *
 * 데이터는 `crewQueries.home` **하나**로 전부 온다 — 헤더·공지·정보·랭킹·스쿼드가 같은 응답이다.
 * 그래서 RN 쪽에 새로 만든 API 함수도, 새 쿼리 키도 없다.
 *
 * **로딩·에러를 여기서 분기하지 않는다.** `useSuspenseQuery` 가 대기를 Suspense 로,
 * 실패를 ErrorBoundary 로 넘긴다. 경계는 `CrewHomeScreen` 이 친다.
 */
export function CrewHomeContent({ route, navigation }: CrewHomeContentProps) {
  const { crewId, crewName } = route.params;
  const insets = useSafeAreaInsets();
  // makeQueryOptions 로 만들어진 옵션이라 data 는 응답 봉투 전체다. 실제 필드는 data.data 안에 있다.
  const { data } = useSuspenseQuery(crewQueries.home({ crewId, page: 1, size: 10 }));

  const home = data.data;

  return (
    // 웹 CrewLayout 의 `p-5` 중 CrewHome 의 `-mx-5 -mt-5` 가 좌·우·상만 취소한다 —
    // **하단 20px 는 남는다.** 그 여백을 여기서 준다.
    <ScrollView className="flex-1 bg-grayscale100" contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
      <CrewHomeHeader
        crew={home.crew}
        canManage={home.states.canManage}
        onManagePress={() => navigation.navigate('CrewManage', { crewId, crewName })}
      />

      <View className="mt-6">
        <CrewInfoPager
          announces={home.announces}
          crew={home.crew}
          onMoreAnnouncePress={() => navigation.navigate('AnnounceList', { crewId, crewName })}
        />

        <View className="mx-5 mt-6 flex-col items-center gap-6">
          <CrewMemberRanking members={home.rankers} />
          <CrewSquadList squads={home.squads} />
        </View>
      </View>
    </ScrollView>
  );
}
