import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KakaoLogo from '../../assets/icons/kakaologo.svg';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../shared/ui/Button';
import { NavButton, NavButtonLabel } from '../../shared/ui/NavButton';
import { Separator } from '../../shared/ui/Separator';
import { Text } from '../../shared/ui/Text';
import { ProfileSummary } from './ProfileSummary';
import { useCurrentUser } from './useCurrentUser';

interface GlobalMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginPress: () => void;
}

/** 웹 SheetContent 의 폭(`sm:max-w-sm` 기본 3/4)에 대응한다. */
const SHEET_WIDTH_RATIO = 0.8;

/** 웹 Sheet 의 `duration-300`(열기) / `duration-500`(닫기) 에 대응한다. */
const OPEN_DURATION_MS = 300;

const CLOSE_DURATION_MS = 200;

/** 웹 GlobalHeader 의 `width={20} height={20}` 과 같다. */
const KAKAO_LOGO_SIZE = 20;

/**
 * 웹 `widgets/GlobalHeader` 의 오른쪽 Sheet 드로어.
 *
 * 웹은 shadcn `ui/sheet`(Radix Dialog) 를 쓰지만 RN 대응물이 없어 내장 `Modal` 로 만든다.
 *
 * **`animationType` 을 쓰지 않는다.** RN Modal 의 `slide` 는 **아래에서** 올라와 바텀시트처럼 보이는데,
 * 웹 Sheet 는 **오른쪽에서** 들어온다. 그래서 Modal 자체는 애니메이션 없이 띄우고
 * 패널만 `translateX` 로 직접 민다. RN 내장 `Animated` 라 reanimated 가 필요 없다
 * (그 패키지는 pod 이 없어 Phase 3 에서 앱을 죽였다).
 *
 * 닫을 때는 **애니메이션이 끝난 뒤에** Modal 을 내린다. 바로 내리면 패널이 튕기듯 사라진다.
 *
 * **아직 화면이 없는 항목은 모양만 두고 동작을 비운다.** 웹과 대조할 기준을 남기기 위해서다.
 * 카카오 로그인·회원가입은 4b 에서 범위 밖으로 정했고(딥링크·이메일 인증 재설계 필요),
 * 프로필 편집·비밀번호 변경·내 활동 3종은 아직 이관 전이다.
 */
export function GlobalMenuSheet({ isOpen, onClose, onLoginPress }: GlobalMenuSheetProps) {
  const { isAuthenticated, logout } = useAuth();
  const user = useCurrentUser(isAuthenticated);
  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();
  const sheetWidth = width * SHEET_WIDTH_RATIO;

  // 닫히는 동안에도 Modal 은 떠 있어야 해서 열림 여부와 따로 둔다.
  const [isMounted, setIsMounted] = useState(isOpen);
  const translateX = useRef(new Animated.Value(sheetWidth)).current;

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: OPEN_DURATION_MS,
        useNativeDriver: true,
      }).start();

      return;
    }

    Animated.timing(translateX, {
      toValue: sheetWidth,
      duration: CLOSE_DURATION_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  }, [isOpen, sheetWidth, translateX]);

  const handleLogout = async () => {
    onClose();

    await logout();
  };

  return (
    <Modal visible={isMounted} animationType="none" transparent onRequestClose={onClose}>
      {/* 바깥을 누르면 닫힌다 — 웹 Sheet 의 overlay 와 같은 동작 */}
      <Pressable className="flex-1 flex-row justify-end bg-black/40" onPress={onClose}>
        <Animated.View
          className="h-full rounded-tl-2xl bg-grayscale100"
          style={{ width: sheetWidth, paddingTop: insets.top, transform: [{ translateX }] }}
        >
          {/* 패널 안쪽 탭이 바깥(닫기)으로 새지 않게 막는다 */}
          <Pressable className="flex-1" onPress={(event) => event.stopPropagation()}>
          <ScrollView contentContainerClassName="p-s-40 pb-s-65">
            <View className="mt-5">
              <ProfileSummary nickname={user?.nickname} profileImage={user?.profileImage} />
            </View>

            {!isAuthenticated ? (
              <>
                <Separator className="my-6" />

                <View className="mb-4 items-center">
                  <Text.sm className="w-full text-center text-grayscale600">소셜계정 혹은 이메일로 로그인하기</Text.sm>
                </View>

                <View className="flex-col items-center justify-center gap-2">
                  <Button variant="outline" className="w-full" onPress={onLoginPress}>
                    <Text.base className="font-semibold text-primary500">이메일로 로그인 하기</Text.base>
                  </Button>

                  {/* 카카오 로그인은 딥링크 콜백 재설계가 필요해 4b 에서 범위 밖으로 뒀다. 모양만 둔다. */}
                  <Button className="w-full flex-row gap-2 bg-kakao">
                    <KakaoLogo width={KAKAO_LOGO_SIZE} height={KAKAO_LOGO_SIZE} />
                    <Text.base className="font-semibold text-kakao-text">카카오로 로그인하기</Text.base>
                  </Button>
                </View>

                <View className="mt-8 flex-col items-center gap-2">
                  <Text.base className="text-grayscale700">아직 회원이 아니신가요?</Text.base>
                  {/* 회원가입은 이메일 인증 코드 흐름이 남아 있어 아직 이관 전이다. */}
                  <Text.base className="text-blue-500 underline">회원가입</Text.base>
                </View>
              </>
            ) : (
              <View className="flex-col">
                <View className="mt-6 flex-col items-center justify-center gap-2">
                  <NavButton>
                    <NavButtonLabel>프로필 편집</NavButtonLabel>
                  </NavButton>
                </View>

                <Separator className="my-6" />

                <View className="flex-col">
                  <Text.sm className="mb-3 w-full text-grayscale600">계정정보</Text.sm>
                  <View className="px-3 py-2">
                    <Text.base className="text-grayscale700">{user?.email}</Text.base>
                  </View>
                  <NavButton>
                    <NavButtonLabel>비밀번호 변경</NavButtonLabel>
                  </NavButton>

                  <Separator className="mb-3 mt-6" />

                  <View className="mt-3">
                    <Text.sm className="mb-3 w-full text-grayscale600">내 활동</Text.sm>
                    <View className="flex-col gap-2">
                      <NavButton>
                        <NavButtonLabel>내 크루</NavButtonLabel>
                      </NavButton>
                      <NavButton>
                        <NavButtonLabel>합류신청</NavButtonLabel>
                      </NavButton>
                      <NavButton>
                        <NavButtonLabel>활동내역</NavButtonLabel>
                      </NavButton>
                    </View>
                  </View>

                  <Separator className="my-6" />

                  <View className="mt-6 flex-col items-center justify-center gap-2">
                    <NavButton onPress={handleLogout}>
                      <NavButtonLabel>로그아웃</NavButtonLabel>
                    </NavButton>
                  </View>
                </View>
              </View>
            )}
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
