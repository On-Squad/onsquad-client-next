import { useState } from 'react';
import { Alert as RNAlert, Image, Pressable, ScrollView, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSuspenseQuery } from '@tanstack/react-query';

import { crewQueries } from '../../entities/crew/api/crew.queries';

import MOCK_CREW_IMAGE from '../../assets/images/mock1.png';
import { useAuth } from '../../auth/AuthProvider';
import type { RootStackParamList } from '../../navigation/types';
import { useCrewImageHeight } from '../../shared/lib/useCrewImageHeight';
import { Avatar } from '../../shared/ui/Avatar';
import { Badge } from '../../shared/ui/Badge';
import { LoginAlert } from '../../shared/ui/LoginAlert';
import { Text } from '../../shared/ui/Text';

export type CrewDetailContentProps = NativeStackScreenProps<RootStackParamList, 'CrewDetail'>;

/** 웹 CrewDetail 의 `h-[5dvh]` — 오버레이 상단 줄 높이. */
const OVERLAY_ROW_RATIO = 0.05;

export function CrewDetailContent({ route, navigation }: CrewDetailContentProps) {
  const { crewId } = route.params;
  const { isAuthenticated } = useAuth();
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);
  const imageHeight = useCrewImageHeight();
  // makeQueryOptions 로 만들어진 옵션이라 data 는 응답 봉투 전체다. 크루 필드는 data.data 안에 있다.
  const { data } = useSuspenseQuery(crewQueries.detail({ crewId }));

  const crew = data.data;

  /**
   * 웹 CrewDetail 의 handleCrewHomeMove 를 옮긴 것이다.
   *
   * 웹은 **이미지 영역 전체가 클릭 대상**이다(별도 버튼이 아니다).
   * 비로그인일 때 로그인 화면으로 보내는 건 MainTabs 의 FAB 가드와 같은 방식이다.
   */
  const handleCrewHomeMove = () => {
    if (crew.states.alreadyParticipant) {
      navigation.navigate('CrewHome', { crewId, crewName: crew.name });

      return;
    }

    if (!isAuthenticated) {
      // 웹은 곧장 이동하지 않고 LoginAlert 를 먼저 띄운다.
      setIsLoginAlertOpen(true);

      return;
    }

    RNAlert.alert('현재 크루에 속해있지 않아요.');
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* 이미지 전체가 크루 홈 진입 버튼이다 — 웹과 같다. */}
      <Pressable onPress={handleCrewHomeMove}>
        <View className="w-full overflow-hidden" style={{ height: imageHeight }}>
          <Image
            source={crew.imageUrl ? { uri: crew.imageUrl } : MOCK_CREW_IMAGE}
            className="h-full w-full"
            resizeMode="cover"
          />

          {/* 웹 CREW_IMAGE_OVERLAY_CLASS 의 그라디언트·backdrop-blur 는 NativeWind 가 못 한다 — 단색으로 간다. */}
          <View className="absolute bottom-0 left-0 w-full flex-col gap-3 bg-black/40 px-5 py-2">
            <View className="flex-row items-center justify-between" style={{ height: imageHeight * OVERLAY_ROW_RATIO }}>
              <Text.base className="font-medium text-white">크루 스페이스</Text.base>

              {crew.states.alreadyParticipant ? (
                <Badge className="bg-primary300">
                  <Text.xs className="font-bold text-black">참여중인 크루</Text.xs>
                </Badge>
              ) : null}
            </View>

            <Text.xl className="font-semibold text-white" numberOfLines={1}>{crew.name}</Text.xl>
          </View>
        </View>
      </Pressable>

      <View className="mb-6 flex-1 px-5">
        <View className="my-6 flex-col gap-2">
          <View className="flex-row gap-3">
            <Text.xl className="font-bold">크루장</Text.xl>
            <View className="flex-row items-center gap-2">
              <Avatar className="h-5 w-5" />
              <Text.xs className="font-semibold text-black">{crew.owner.nickname}</Text.xs>
              <Text.xs>{crew.owner.mbti || '신비주의'}</Text.xs>
            </View>
          </View>
          <Text.base className="font-medium">{crew.introduce}</Text.base>
        </View>

        <View className="my-6 flex-col gap-2">
          <Text.xl className="font-bold">크루 상세정보</Text.xl>
          <Text.base className="font-medium">{crew.detail}</Text.base>
        </View>

        <View className="my-6 flex-row flex-wrap items-center gap-2">
          <Badge>멤버 수 {crew.memberCount} 명</Badge>
          {crew.hashtags.map((tag) => (
            <Badge key={String(tag)}>{String(tag)}</Badge>
          ))}
        </View>
      </View>

      <LoginAlert
        isOpen={isLoginAlertOpen}
        onClose={() => setIsLoginAlertOpen(false)}
        onLoginPress={() => {
          setIsLoginAlertOpen(false);
          navigation.navigate('Login');
        }}
      />
    </ScrollView>
  );
}
