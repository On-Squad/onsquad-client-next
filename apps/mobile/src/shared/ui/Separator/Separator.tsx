import { View } from 'react-native';

import { cn } from '@/shared/lib/utils';

/** 웹 shadcn `ui/separator` 의 RN 미러. 가로 구분선만 쓴다. */
export function Separator({ className }: { className?: string }) {
  return <View className={cn('h-px w-full bg-grayscale200', className)} />;
}
