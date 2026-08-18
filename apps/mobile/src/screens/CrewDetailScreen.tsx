import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Image, ScrollView, View } from 'react-native';

import { crewQueries } from '@/entities/crew';

import { Badge } from '../shared/ui/Badge';
import { ScreenError, ScreenLoading } from '../shared/ui/ScreenState';
import { Text } from '../shared/ui/Text';
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

      <Text.xl className="mt-s-30 font-semibold">{crew.name}</Text.xl>
      <Text.xs className="mt-s-10 text-grayscale600">멤버 {crew.memberCount}명</Text.xs>

      <Text.base className="mt-s-30 font-medium">{crew.introduce}</Text.base>
      <Text.base className="mt-s-20 font-medium text-grayscale600">{crew.detail}</Text.base>

      <View className="mt-s-30 flex-row flex-wrap gap-s-10">
        {crew.hashtags.map((tag) => (
          <Badge key={String(tag)}>{`#${String(tag)}`}</Badge>
        ))}
      </View>

      <View className="mt-s-40 border-t border-grayscale200 pt-s-30">
        <Text.xl className="font-bold">크루장</Text.xl>
        <Text.xs className="mt-s-10 font-semibold text-black">{crew.owner.nickname}</Text.xs>
        <Text.xs className="mt-s-10 text-grayscale600">{crew.owner.introduce}</Text.xs>
      </View>
    </ScrollView>
  );
}
