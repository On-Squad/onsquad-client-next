import { Pressable, View } from 'react-native';

import { Bell, Text as TextIcon } from 'lucide-react-native';

import OnsquadLogo from '../../assets/icons/onsquad_logo.svg';
import { useAuth } from '../../auth/AuthProvider';
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
 * 알림 벨은 웹과 같이 **로그인 상태에서만** 노출한다. 알림 화면은 아직 이관 전이라 동작은 비어 있다.
 *
 * **드로어는 여기서 그리지 않는다.** 여는 것만 하고 실제 시트는 화면 쪽에 있다 —
 * 이유는 `GlobalMenuContext` 주석 참고.
 */
export function GlobalHeader() {
  const { isAuthenticated } = useAuth();
  const { open } = useGlobalMenu();

  return (
    <View className="w-full flex-row items-center justify-between">
      <OnsquadLogo width={LOGO_WIDTH} height={LOGO_HEIGHT} />

      <View className="flex-row items-center gap-4">
        {isAuthenticated ? <Bell size={24} color={ICON_COLOR} strokeWidth={ICON_STROKE_WIDTH} /> : null}

        <Pressable onPress={open} hitSlop={8}>
          <TextIcon size={24} color={ICON_COLOR} strokeWidth={ICON_STROKE_WIDTH} />
        </Pressable>
      </View>
    </View>
  );
}
