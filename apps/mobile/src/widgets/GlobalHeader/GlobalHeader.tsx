import { Pressable, View } from 'react-native';

import { Bell, Text as TextIcon } from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import OnsquadLogo from '../../assets/icons/onsquad_logo.svg';
import { useAuth } from '../../auth/AuthProvider';
import { formatUnreadBadge, useUnreadBadgeCount } from '../../entities/notification';
import type { RootStackParamList } from '../../navigation/types';
import { Text } from '../../shared/ui/Text';
import { useGlobalMenu } from './GlobalMenuContext';

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외). 웹 GlobalHeader 와 같은 값이다.
const ICON_COLOR = '#636363';

const ICON_STROKE_WIDTH = 1.5;

const LOGO_WIDTH = 80;

const LOGO_HEIGHT = 32;

/**
 * 웹 `widgets/GlobalHeader` 의 RN 미러 — 탭 화면의 헤더다.
 *
 * 웹은 `fixed` 헤더를 직접 그리지만 RN 은 **네이티브 스택 헤더의 슬롯**에 넣는다(§2.0).
 * 그래서 위치·그림자·safe-area 는 네이티브가 처리하고, 여기서는 내용만 그린다.
 *
 * 알림 벨은 웹과 같이 **로그인 상태에서만** 노출한다.
 *
 * **드로어는 여기서 그리지 않는다.** 여는 것만 하고 실제 시트는 화면 쪽에 있다 —
 * 이유는 `GlobalMenuContext` 주석 참고.
 */
export function GlobalHeader() {
  const { isAuthenticated } = useAuth();
  const { open } = useGlobalMenu();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unreadCount = useUnreadBadgeCount(isAuthenticated);
  const badgeText = formatUnreadBadge(unreadCount);

  return (
    <View className="w-full flex-row items-center justify-between">
      <OnsquadLogo width={LOGO_WIDTH} height={LOGO_HEIGHT} />

      {/*
        아이콘 사이 간격이 웹(`gap-4`, 16px)보다 좁다.
        아래 벨 래퍼가 배지를 품느라 좌우로 6px 씩 커졌기 때문이다 —
        6 + 10 = 16 으로 **눈에 보이는 간격은 웹과 같다.**
      */}
      <View className="flex-row items-center gap-2.5">
        {isAuthenticated ? (
          <Pressable onPress={() => navigation.navigate('Notification')} hitSlop={8}>
            {/*
              **배지를 아이콘 밖으로 내보내지 않는다.**
              Android 는 부모 경계를 넘는 자식을 잘라낸다 — `overflow: visible` 이 듣지 않아
              배지 오른쪽과 숫자가 직선으로 깎여 보였다(에뮬레이터 실측).
              음수 마진으로 되돌리는 방법은 경계를 `Pressable` 로 옮길 뿐이라 그대로 잘린다.

              그래서 래퍼를 **배지까지 품는 36×36** 으로 잡고 벨을 그 안에 가운데 정렬한다.
              배지는 래퍼 모서리(`right-0 top-0`)에 앉으므로 벨 기준으로는 웹과 같은
              오른쪽 +6px · 위 -6px 가 되고, 아무것도 경계를 넘지 않는다.
            */}
            <View className="h-9 w-9 items-center justify-center">
              <Bell size={24} color={ICON_COLOR} strokeWidth={ICON_STROKE_WIDTH} />
              {badgeText ? (
                <View className="absolute right-0 top-0 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-[3px] py-[1px]">
                  <Text.xs className="text-white">{badgeText}</Text.xs>
                </View>
              ) : null}
            </View>
          </Pressable>
        ) : null}

        <Pressable onPress={open} hitSlop={8}>
          <TextIcon size={24} color={ICON_COLOR} strokeWidth={ICON_STROKE_WIDTH} />
        </Pressable>
      </View>
    </View>
  );
}
