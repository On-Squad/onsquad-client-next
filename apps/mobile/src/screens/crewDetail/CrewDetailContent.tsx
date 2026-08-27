import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSuspenseQuery } from '@tanstack/react-query';

import { crewQueries } from '../../entities/crew/api/crew.queries';
import { isCrewOwner } from '../../entities/crew/lib/isCrewOwner';

import MOCK_CREW_IMAGE from '../../assets/images/mock1.png';
import { useAuth } from '../../auth/AuthProvider';
import type { RootStackParamList } from '../../navigation/types';
import { useCancelRequestMutation } from '../../features/crew/detail/model/useCancelRequestMutation';
import { useCrewRequestMutation } from '../../features/crew/detail/model/useCrewRequestMutation';
import { useLeaveCrewMutation } from '../../features/crew/detail/model/useLeaveCrewMutation';
import { useCrewImageHeight } from '../../shared/lib/useCrewImageHeight';
import { ALERT_BUTTON, Alert } from '../../shared/ui/Alert';
import { Avatar } from '../../shared/ui/Avatar';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { LoginAlert } from '../../shared/ui/LoginAlert';
import { Text } from '../../shared/ui/Text';
import { toast } from '../../shared/ui/Toast';

export type CrewDetailContentProps = NativeStackScreenProps<RootStackParamList, 'CrewDetail'>;

/** 웹 CrewDetail 의 `h-[5dvh]` — 오버레이 상단 줄 높이. */
const OVERLAY_ROW_RATIO = 0.05;

export function CrewDetailContent({ route, navigation }: CrewDetailContentProps) {
  const { crewId } = route.params;
  const { isAuthenticated, me } = useAuth();
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);
  const [isNotParticipantAlertOpen, setIsNotParticipantAlertOpen] = useState(false);
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = useState(false);
  const imageHeight = useCrewImageHeight();
  const insets = useSafeAreaInsets();
  // makeQueryOptions 로 만들어진 옵션이라 data 는 응답 봉투 전체다. 크루 필드는 data.data 안에 있다.
  const { data } = useSuspenseQuery(crewQueries.detail({ crewId }));

  const crew = data.data;

  /**
   * 웹은 `alreadyParticipant && owner.nickname === user.nickname` 으로 판정한다.
   * 서버가 크루 상세에서 오너 플래그를 주지 않기 때문인데, 닉네임 비교는 오판이 난다.
   * `owner.id` 로 바꾼 근거는 `entities/crew/lib/isCrewOwner` 주석에 있다.
   */
  const isOwner = crew.states.alreadyParticipant && isCrewOwner({ ownerId: crew.owner.id, myId: me?.id });

  // 비로그인이면 서버가 states 를 비워 보낸다(실측) — 웹처럼 false 로 받는다.
  const alreadyRequest = crew.states.alreadyRequest ?? false;

  const { mutate: requestCrew, isPending: isRequesting } = useCrewRequestMutation({ crewId });
  const { mutate: cancelRequest, isPending: isCancelling } = useCancelRequestMutation({ crewId });

  const { mutate: leaveCrew, isPending: isLeaving } = useLeaveCrewMutation({ crewId });

  /**
   * **`mutateAsync` + `await` 를 쓰지 않는다.**
   * 실패하면 그 promise 가 reject 되는데 여기서 잡지 않아 unhandled rejection 이 된다.
   * 게다가 `await` 다음 줄이 통째로 안 돌아, 성공했는지 실패했는지가 흐름에 안 드러난다.
   * `onSuccess` 는 성공했을 때만 부른다 — 실패 알림은 presenter 가 이미 맡고 있다.
   */
  const handleCrewRequest = () => {
    requestCrew(crewId, { onSuccess: () => toast('가입 신청이 완료되었어요') });
  };

  const handleLeave = () => {
    setIsLeaveAlertOpen(false);

    // 웹도 성공 시에만 뒤로 간다 — 실패하면 화면에 남아 사유 토스트를 보게 된다.
    leaveCrew(undefined, { onSuccess: () => navigation.goBack() });
  };

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

    // 웹도 토스트가 아니라 Alert 다 — 문구까지 같게 맞춘다.
    setIsNotParticipantAlertOpen(true);
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: insets.bottom }}>
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

              <View className="flex-row items-center gap-2">
                {crew.states.alreadyParticipant ? (
                  <Badge className="bg-primary300">
                    <Text.xs className="font-bold text-black">참여중인 크루</Text.xs>
                  </Badge>
                ) : null}
                {isOwner ? (
                  <Badge className="bg-primary400">
                    <Text.xs className="font-bold text-black">크루장</Text.xs>
                  </Badge>
                ) : null}
              </View>
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

        {/*
          웹 CrewDetail 의 buttonArea 와 같은 조건이다 —
          비로그인·이미 참여중·크루장에게는 이 영역 자체가 없다.
        */}
        {isAuthenticated && !crew.states.alreadyParticipant && !isOwner ? (
          <View className="flex-col items-center gap-4 pb-12 pt-6">
            <Button
              className="w-full"
              isDisabled={alreadyRequest}
              isLoading={isRequesting}
              onPress={handleCrewRequest}
            >
              <Text.base className="font-bold text-white">
                {alreadyRequest ? '가입 신청 완료' : '가입 신청하기'}
              </Text.base>
            </Button>

            {alreadyRequest ? (
              <Pressable disabled={isCancelling} onPress={() => cancelRequest(crewId)}>
                <Text.sm className="text-grayscale500">취소</Text.sm>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* 웹과 같은 조건 — 참여중이면서 크루장이 아닐 때만 보인다. */}
      {crew.states.alreadyParticipant && !isOwner ? (
        <View className="items-center pb-10">
          <Pressable
            disabled={isLeaving}
            onPress={() => setIsLeaveAlertOpen(true)}
            className="border-b border-grayscale500"
          >
            <Text.sm className="text-grayscale500">크루 나가기</Text.sm>
          </Pressable>
        </View>
      ) : null}

      <Alert
        isOpen={isLeaveAlertOpen}
        onClose={() => setIsLeaveAlertOpen(false)}
        title="크루를 나갈까요?"
        buttonSlot={
          <View className="flex-row">
            <Pressable className={ALERT_BUTTON.CANCEL} onPress={() => setIsLeaveAlertOpen(false)}>
              <Text.lg className="text-grayscale600">취소</Text.lg>
            </Pressable>
            <Pressable className={ALERT_BUTTON.ACTION} onPress={handleLeave}>
              <Text.lg className="text-white">나가기</Text.lg>
            </Pressable>
          </View>
        }
      >
        <Text.base className="text-center text-grayscale700">
          크루를 나가면 다시 가입 신청이 필요합니다.
        </Text.base>
      </Alert>

      <LoginAlert
        isOpen={isLoginAlertOpen}
        onClose={() => setIsLoginAlertOpen(false)}
        onLoginPress={() => {
          setIsLoginAlertOpen(false);
          navigation.navigate('Login');
        }}
      />

      <Alert isOpen={isNotParticipantAlertOpen} onClose={() => setIsNotParticipantAlertOpen(false)}>
        <Text.base className="text-center text-grayscale700">
          현재 크루에 속해있지 않아요. 참가 신청을 눌러 먼저 크루에 가입해주세요!
        </Text.base>
      </Alert>
    </ScrollView>
  );
}
