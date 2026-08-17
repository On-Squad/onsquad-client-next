import { FlatList, View } from 'react-native';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { crewQueries } from '@/entities/crew';

import { CrewCard } from '../components/CrewCard';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { ScreenError, ScreenLoading } from '../shared/ui/ScreenState';
import { Text } from '../shared/ui/Text';

// 탭 화면이지만 상세로 가려면 부모 스택을 타야 한다 — 두 내비게이터를 합친다.
type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

/**
 * 웹 `pages/home` 의 RN 대응물 — 최소 구현.
 *
 * 웹은 배너 + MainDashboard + HomeCrewList 셋이다.
 * MainDashboard 와 배너 SVG 2장은 Phase 4b 로 미뤘다.
 */
function HomeBanner() {
  return (
    <View className="w-full rounded-xl bg-[#144A7D] p-9">
      <Text.lg className="mb-1 font-semibold text-white">모임이 좋았을 뿐인데,,,</Text.lg>
      <Text.xxl className="mb-2 font-semibold text-white">점점 부담이 되고 있다면?</Text.xxl>
      <Text.lg className="font-semibold text-white">온스쿼드에 합류하세요!</Text.lg>
    </View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { data, isPending, isError, refetch } = useQuery(crewQueries.list({ page: 1, size: 10 }));

  if (isPending) {
    return <ScreenLoading />;
  }

  if (isError) {
    return <ScreenError message="크루 목록을 불러오지 못했어요." onRetry={() => void refetch()} />;
  }

  return (
    <View className="flex-1 bg-grayscale100">
      <FlatList
        data={data?.results ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="p-s-30"
        ListHeaderComponent={
          <View className="mb-s-30">
            <HomeBanner />
          </View>
        }
        renderItem={({ item }) => (
          <CrewCard
            name={item.name}
            introduce={item.introduce}
            memberCount={item.memberCount}
            imageUrl={item.imageUrl}
            onPress={() => navigation.navigate('CrewDetail', { crewId: item.id, crewName: item.name })}
          />
        )}
      />
    </View>
  );
}
