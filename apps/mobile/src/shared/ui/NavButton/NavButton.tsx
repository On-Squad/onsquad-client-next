import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';

import { cn } from '@/shared/lib/utils';

import { Text } from '../Text';

interface NavButtonProps {
  children: ReactNode;
  className?: string;
  onPress?: () => void;
}

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외). 웹 NavButton 의 stroke 와 같다.
const CHEVRON_COLOR = '#000000';

const CHEVRON_SIZE = 20;

/** 웹 `shared/ui/NavButton` 의 RN 미러. 마이페이지·세팅의 이동 버튼. */
export function NavButton({ children, className, onPress }: NavButtonProps) {
  return (
    <Pressable onPress={onPress} className={cn('w-full p-3', className)}>
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">{children}</View>
        <ChevronRight size={CHEVRON_SIZE} color={CHEVRON_COLOR} strokeWidth={2} />
      </View>
    </Pressable>
  );
}

/** 웹은 `<span>` 하나지만 RN 은 문자열을 Text 로 감싸야 한다. 호출부를 웹과 같게 두려고 함께 둔다. */
export function NavButtonLabel({ children }: { children: ReactNode }) {
  return <Text.base className="font-medium text-black">{children}</Text.base>;
}
