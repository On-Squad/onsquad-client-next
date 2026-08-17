import { Pressable, View } from 'react-native';

import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Plus, Users } from 'lucide-react-native';

// 웹 BottomTab 의 text-primary / bg-primary 에 대응한다.
// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외).
const PRIMARY = '#FF7800';
const WHITE = '#FFFFFF';

/**
 * 탭바 가운데 칸. **탭이 아니라 버튼이다** — 웹 BottomTab 과 같다.
 *
 * 탭바를 통째로 교체하지 않고 이 칸만 슬롯으로 갈아끼운다.
 * 그래야 탭 전환 애니메이션·safe-area·키보드 회피를 네이티브가 계속 처리한다.
 */
export function CrewNewTabButton({ onPress, accessibilityState }: BottomTabBarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="크루 개설하기"
      accessibilityState={accessibilityState}
      className="flex-1 items-center justify-center py-3"
    >
      <View className="relative">
        <Users color={PRIMARY} size={28} strokeWidth={2} />

        <View className="absolute -right-1 -top-1 h-3.5 w-3.5 items-center justify-center rounded-full bg-primary">
          <Plus color={WHITE} size={10} strokeWidth={3} />
        </View>
      </View>
    </Pressable>
  );
}
