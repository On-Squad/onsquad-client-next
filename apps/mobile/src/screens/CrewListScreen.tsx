import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { FlatList, View } from 'react-native';

import { crewQueries } from '@/entities/crew';

import { CrewCard } from '../components/CrewCard';
import { ScreenError, ScreenLoading } from '../shared/ui/ScreenState';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CrewList'>;

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
