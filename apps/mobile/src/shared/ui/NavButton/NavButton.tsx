import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { ChevronRight } from 'lucide-react-native';

import { cn } from '../../lib/utils';

import { Text } from '../Text';

interface NavButtonProps {
  children: ReactNode;
  className?: string;
  /** 웹은 shadcn Button 이라 원래 받는 prop 이다. 미러링 누락이라 뒤늦게 채운다. */
  disabled?: boolean;
  onPress?: () => void;
}

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외). 웹 NavButton 의 stroke 와 같다.
const CHEVRON_COLOR = '#000000';

const CHEVRON_SIZE = 20;

/**
 * 웹 `shared/ui/NavButton` 의 RN 미러. 마이페이지·세팅의 이동 버튼.
 *
 * `bg-white` 는 웹 shadcn outline variant 의 `bg-background` 다.
 * 래퍼(`w-full border-0 p-3`)가 이걸 덮지 않아 웹에서는 회색 시트 위의 흰 알약으로 보인다.
 * 없으면 배경과 같은 색이라 버튼으로 안 보인다.
 */
export function NavButton({ children, className, disabled, onPress }: NavButtonProps) {
  return (
    <Pressable disabled={disabled} onPress={onPress} className={cn('w-full rounded-md bg-white p-3', className)}>
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
