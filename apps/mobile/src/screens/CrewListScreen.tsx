import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { FlatList, View } from 'react-native';

import { crewQueries } from '../entities/crew/api/crew.queries';

import { CrewCard } from '../entities/crew/ui/CrewCard';
import { ScreenError, ScreenLoading } from '../shared/ui/ScreenState';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

// 탭 화면이지만 상세로 가려면 부모 스택을 타야 한다 — 두 내비게이터를 합친다.
type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Community'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function CrewListScreen({ navigation }: Props) {
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
