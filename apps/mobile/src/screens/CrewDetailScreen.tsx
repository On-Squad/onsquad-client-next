import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Alert, Image, ScrollView, View } from 'react-native';

import { crewQueries } from '@/entities/crew';

import { useAuth } from '../auth/AuthProvider';
import { Badge } from '../shared/ui/Badge';
import { Button } from '../shared/ui/Button';
import { ScreenError, ScreenLoading } from '../shared/ui/ScreenState';
import { Text } from '../shared/ui/Text';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CrewDetail'>;

export function CrewDetailScreen({ route, navigation }: Props) {
  const { crewId } = route.params;
  const { isAuthenticated } = useAuth();
  // makeQueryOptions 로 만들어진 옵션이라 data 는 응답 봉투 전체다. 크루 필드는 data.data 안에 있다.
  const { data, isPending, isError, refetch } = useQuery(crewQueries.detail({ crewId }));

  if (isPending) {
    return <ScreenLoading />;
  }

  const crew = data?.data;

  if (isError || !crew) {
    return <ScreenError message="크루 정보를 불러오지 못했어요." onRetry={() => void refetch()} />;
  }

  /**
   * 웹 `features/crew/detail/ui/CrewDetail` 의 handleCrewHomeMove 를 옮긴 것이다.
   *
   * 비로그인일 때 로그인 모달을 여는 것은 **MainTabs 의 FAB 가드와 같은 방식**이다.
   * 웹은 LoginAlert 오버레이를 띄우지만, 두 진입점이 같게 동작하는 편이 낫다.
   */
  const handleCrewHomeMove = () => {
    if (crew.states.alreadyParticipant) {
      navigation.navigate('CrewHome', { crewId, crewName: crew.name });

      return;
    }

    if (!isAuthenticated) {
      navigation.navigate('Login');

      return;
    }

    Alert.alert('현재 크루에 속해있지 않아요.');
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="p-s-30">
      {crew.imageUrl ? (
        <Image source={{ uri: crew.imageUrl }} className="h-48 w-full rounded-xl" />
      ) : (
        <View className="h-48 w-full rounded-xl bg-grayscale200" />
      )}

      <Text.xl className="mt-s-30 font-semibold">{crew.name}</Text.xl>
      <Text.xs className="mt-s-10 text-grayscale600">멤버 {crew.memberCount}명</Text.xs>

      <Button className="mt-s-30" onPress={handleCrewHomeMove}>
        <Text.base className="font-semibold text-white">크루 스페이스 가기</Text.base>
      </Button>

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
