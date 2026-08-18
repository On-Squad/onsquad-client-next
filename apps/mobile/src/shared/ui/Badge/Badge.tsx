import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/shared/lib/utils';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  /** 넘기면 우측에 삭제 버튼이 붙는다. */
  onRemove?: () => void;
  /** 선택 목록에서 고르는 용도로 쓸 때. */
  onPress?: () => void;
  selected?: boolean;
}

/**
 * 웹 `shared/ui/Badge` 의 RN 미러.
 *
 * 웹과 같이 **children 을 그대로 그린다.** 해시태그의 '#' 는 호출부가 붙인다 —
 * Phase 3 에서 여기에 '#' 를 박아둔 것은 실수였다(스파이크의 해시태그 칩을 그대로 승격시켰다).
 * 스쿼드 카테고리·정원 뱃지에는 '#' 가 붙으면 안 된다.
 *
 * `onRemove` · `selected` 는 웹에 없다. 크루 개설 폼의 해시태그 선택 UI 용이다.
 */
export function Badge({ children, className, onRemove, onPress, selected = false }: BadgeProps) {
  const body = (
    <View
      className={cn(
        'flex-row items-center gap-s-10 rounded-full px-s-30 py-s-10',
        selected ? 'bg-primary500' : 'bg-grayscale100',
        className,
      )}
    >
      <Text className={cn('text-75', selected ? 'text-white' : 'text-grayscale600')}>{children}</Text>

      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text className={cn('text-75', selected ? 'text-white' : 'text-grayscale600')}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return <Pressable onPress={onPress}>{body}</Pressable>;
}
