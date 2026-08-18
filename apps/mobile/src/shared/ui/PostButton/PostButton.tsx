import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '@/shared/lib/utils';

interface PostButtonProps {
  children: ReactNode;
  className?: string;
  onPress?: () => void;
}

/**
 * 웹 `shared/ui/PostButton` 의 RN 미러. 둥근 테두리 작성 버튼이다.
 *
 * 웹은 prop 이름이 `onPageMove` 지만 RN 에는 페이지 이동 개념이 없다.
 * `Card` 가 웹 `onClick` 을 `onPress` 로 받은 것과 같은 규칙으로 `onPress` 를 쓴다.
 */
export function PostButton({ children, className, onPress }: PostButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <View className={cn('h-fit flex-row items-center rounded-full bg-white px-1 py-0.5', className)}>{children}</View>
    </Pressable>
  );
}
