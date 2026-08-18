import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

import { cn } from '../../lib/utils';

import { type ButtonVariantProps, buttonVariants } from './buttonVariants';

interface ButtonProps extends ButtonVariantProps {
  children?: ReactNode;
  className?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
}

/**
 * 웹 `shared/ui/Button` 의 RN 미러.
 *
 * 웹은 `disabled` prop + `disabled:` 클래스로 회색 처리를 하지만
 * NativeWind 에는 `disabled:` variant 가 없다. 그래서 prop 이름을 `isDisabled` 로 바꾸고
 * 클래스를 조건부로 붙인다 — 같은 이름으로 두면 "같은 이름인데 다르게 동작"이 되어 더 위험하다.
 */
const DISABLED_CLASS = 'bg-grayscale300';

// ActivityIndicator 는 RN 내장이라 className 이 먹지 않는다 — 토큰 예외.
const SPINNER_COLOR = '#FFFFFF';

const Button = ({
  children,
  variant,
  size,
  isLoading = false,
  isDisabled = false,
  className,
  onPress,
}: ButtonProps) => {
  const disabled = isLoading || isDisabled;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn(buttonVariants({ variant, size }), className, disabled && DISABLED_CLASS)}
    >
      {isLoading ? <ActivityIndicator color={SPINNER_COLOR} /> : children}
    </Pressable>
  );
};

export { Button };
