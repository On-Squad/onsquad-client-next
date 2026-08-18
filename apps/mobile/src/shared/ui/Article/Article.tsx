import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/utils';

interface ArticleProps {
  slot: ReactNode;
  className?: string;
}

/**
 * 웹 `shared/ui/Article` 의 RN 미러. 카드형 섹션 껍데기다.
 *
 * 웹의 `ref` prop 은 옮기지 않는다 — 무한스크롤 sentinel 용이고 RN 은 FlatList 가 대신한다.
 */
export function Article({ slot, className }: ArticleProps) {
  return <View className={cn('rounded-xl bg-white p-6', className)}>{slot}</View>;
}
