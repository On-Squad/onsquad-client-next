import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Image, ScrollView, Text, View } from 'react-native';

import { crewQueries } from '@/entities/crew';

import { ScreenError, ScreenLoading } from '../shared/ui/ScreenState';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CrewDetail'>;

export function CrewDetailScreen({ route }: Props) {
  const { crewId } = route.params;
  // makeQueryOptions 로 만들어진 옵션이라 data 는 응답 봉투 전체다. 크루 필드는 data.data 안에 있다.
  const { data, isPending, isError, refetch } = useQuery(crewQueries.detail({ crewId }));

  if (isPending) {
    return <ScreenLoading />;
  }

  const crew = data?.data;

  if (isError || !crew) {
    return <ScreenError message="크루 정보를 불러오지 못했어요." onRetry={() => void refetch()} />;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="p-s-30">
      {crew.imageUrl ? (
        <Image source={{ uri: crew.imageUrl }} className="h-48 w-full rounded-xl" />
      ) : (
        <View className="h-48 w-full rounded-xl bg-grayscale200" />
      )}

      <Text className="mt-s-30 text-150 font-bold">{crew.name}</Text>
      <Text className="mt-s-10 text-75 text-grayscale600">멤버 {crew.memberCount}명</Text>

      <Text className="mt-s-30 text-100">{crew.introduce}</Text>
      <Text className="mt-s-20 text-75 text-grayscale600">{crew.detail}</Text>

      <View className="mt-s-30 flex-row flex-wrap gap-s-10">
        {crew.hashtags.map((tag) => (
          <View key={String(tag)} className="rounded-full bg-grayscale100 px-s-20 py-s-10">
            <Text className="text-75 text-grayscale600">#{String(tag)}</Text>
          </View>
        ))}
      </View>

      <View className="mt-s-40 border-t border-grayscale200 pt-s-30">
        <Text className="text-75 text-grayscale600">크루장</Text>
        <Text className="mt-s-10 text-100 font-semibold">{crew.owner.nickname}</Text>
        <Text className="mt-s-10 text-75 text-grayscale600">{crew.owner.introduce}</Text>
      </View>
    </ScrollView>
  );
}
