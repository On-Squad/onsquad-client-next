import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { cn } from '../../lib/utils';

export interface CardPropsType {
  title: string | ReactNode;
  children: ReactNode;
  className?: string;

  onPress?: () => void;
}

/**
 * 웹 `shared/ui/Card` 의 RN 미러.
 *
 * 웹의 forwardRef 는 무한스크롤 sentinel 용이라 옮기지 않는다 —
 * RN 은 FlatList 의 onEndReached 를 쓴다.
 */
const Card = ({ title, children, className, onPress }: CardPropsType) => {
  const body = (
    <View className={cn('min-h-32 w-full rounded-md bg-white p-2', className)}>
      <View>{title}</View>
      <View>{children}</View>
    </View>
  );

  if (!onPress) {
    return body;
  }

  return <Pressable onPress={onPress}>{body}</Pressable>;
};

export default Card;
