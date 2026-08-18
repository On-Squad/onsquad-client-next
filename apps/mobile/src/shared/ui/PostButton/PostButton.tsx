import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '../../lib/utils';

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
 *
 * **글자색을 여기서 준다.** 웹은 shadcn outline variant 의 `text-primary` 가
 * 래퍼(`border-0 bg-white`)에 덮이지 않고 살아남아 글자와 아이콘이 주황이다.
 * RN 은 부모 View 의 색이 자식 Text 로 상속되지 않아, 안 주면 글자만 검정이 된다.
 */
export function PostButton({ children, className, onPress }: PostButtonProps) {
  return (
    <Pressable onPress={onPress}>
      <View className={cn('h-fit flex-row items-center rounded-full bg-white px-1 py-0.5', className)}>{children}</View>
    </Pressable>
  );
}
