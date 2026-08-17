import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { Text } from '../Text';
import { BackButton } from './BackButton';

// 웹 Appbar 의 bg-white. headerStyle 은 RN 스타일 객체라 className 대상이 아니다 — 토큰 예외.
const HEADER_BACKGROUND = '#FFFFFF';

interface AppHeaderOptionsParams {
  title: string;
  headerRight?: NativeStackNavigationOptions['headerRight'];
}

/**
 * 웹 `shared/ui/Appbar` 의 모양을 네이티브 스택 헤더 슬롯으로 옮긴다.
 *
 * `headerShown: false` 를 쓰지 않는 것이 핵심이다 —
 * 그러면 백 제스처·화면 전환·safe-area 를 다시 직접 계산해야 하고,
 * 그건 지금 웹뷰가 겪는 문제를 RN 에서 반복하는 것이다.
 * 모양만 슬롯으로 갈아끼우고 배관은 네이티브에 남긴다.
 */
export const appHeaderOptions = ({ title, headerRight }: AppHeaderOptionsParams): NativeStackNavigationOptions => ({
  // 웹 Appbar 는 <h3 className="font-bold"> 다. Tailwind preflight 이 heading 크기를
  // inherit 으로 되돌리므로 실제 렌더 크기는 body 기본값(16px) = Text.base 다.
  headerTitle: () => <Text.base className="font-bold">{title}</Text.base>,
  headerLeft: ({ canGoBack }) => (canGoBack ? <BackButton /> : null),
  headerTitleAlign: 'center',
  headerStyle: { backgroundColor: HEADER_BACKGROUND },
  headerShadowVisible: true,
  headerRight,
});
