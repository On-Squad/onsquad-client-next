import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/shared/lib/utils';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  /** 넘기면 우측에 삭제 버튼이 붙는다. 웹에는 없다 — 크루 개설 폼의 해시태그 선택 UI 용. */
  onRemove?: () => void;
  /** 선택 목록에서 고르는 용도로 쓸 때. 웹에는 없다. */
  onPress?: () => void;
  selected?: boolean;
}

/**
 * 웹 `shared/ui/Badge` 의 RN 미러.
 *
 * 웹은 shadcn `ui/badge` 의 base 위에 래퍼가 override 하는 2단 구조라
 * **둘을 합친 최종 클래스**를 옮겨야 한다. 래퍼만 보면 base 를 놓친다.
 *
 *   base(default variant) : rounded-full border border-transparent px-2.5 py-0.5
 *                           text-xs font-semibold bg-primary text-primary-foreground
 *   래퍼 override         : rounded-md bg-secondary px-1.5 font-bold
 *   ------------------------------------------------------------------
 *   최종                  : rounded-md bg-secondary px-1.5 py-0.5 text-xs font-bold
 *                           text-primary-foreground
 *
 * base 의 `transition-colors` 는 옮기지 않는다 — NativeWind 가 reanimated 로 컴파일하는데
 * 그 pod 이 없어 앱이 죽는다(Phase 3 사건).
 * `hover:` 도 터치에는 없다.
 */
const BADGE_BASE = 'flex-row items-center gap-s-10 rounded-md border border-transparent bg-secondary px-1.5 py-0.5';

const LABEL_BASE = 'text-xs font-bold text-primary-foreground';

export function Badge({ children, className, onRemove, onPress, selected = false }: BadgeProps) {
  const body = (
    <View className={cn(BADGE_BASE, selected && 'bg-primary', className)}>
      <Text className={LABEL_BASE}>{children}</Text>

      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text className={LABEL_BASE}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return <Pressable onPress={onPress}>{body}</Pressable>;
}
