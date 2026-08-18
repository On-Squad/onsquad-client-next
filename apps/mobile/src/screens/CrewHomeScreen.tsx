import { ScrollView, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { crewQueries } from '@/entities/crew';

import { CrewHomeHeader } from '../features/crew/home/ui/CrewHomeHeader';
import { CrewInfoPager } from '../features/crew/home/ui/CrewInfoPager';
import { CrewMemberRanking } from '../features/crew/home/ui/CrewMemberRanking';
import { CrewSquadList } from '../features/crew/home/ui/CrewSquadList';
import type { RootStackParamList } from '../navigation/types';
import { ScreenError, ScreenLoading } from '../shared/ui/ScreenState';

type Props = NativeStackScreenProps<RootStackParamList, 'CrewHome'>;

/**
 * 웹 `features/crew/home/ui/CrewHome` + `pages/crews/home` 에 대응한다.
 *
 * 데이터는 `crewQueries.home` **하나**로 전부 온다 — 헤더·공지·정보·랭킹·스쿼드가 같은 응답이다.
 * 그래서 RN 쪽에 새로 만든 API 함수도, 새 쿼리 키도 없다.
 */
export function CrewHomeScreen({ route }: Props) {
  const { crewId } = route.params;
  // makeQueryOptions 로 만들어진 옵션이라 data 는 응답 봉투 전체다. 실제 필드는 data.data 안에 있다.
  const { data, isPending, isError, refetch } = useQuery(crewQueries.home({ crewId, page: 1, size: 10 }));

  if (isPending) {
    return <ScreenLoading />;
  }

  const home = data?.data;

  if (isError || !home) {
    return <ScreenError message="크루 홈을 불러오지 못했어요." onRetry={() => void refetch()} />;
  }

  return (
    <ScrollView className="flex-1 bg-grayscale100">
      <CrewHomeHeader crew={home.crew} canManage={home.states.canManage} />

      <View className="mt-6">
        <CrewInfoPager announces={home.announces} crew={home.crew} />

        <View className="mx-5 mt-6 flex-col items-center gap-6">
          <CrewMemberRanking members={home.rankers} />
          <CrewSquadList squads={home.squads} />
        </View>
      </View>
    </ScrollView>
  );
}
