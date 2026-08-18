import type { ReactNode } from 'react';
import { Text as RNText } from 'react-native';

import { cn } from '../../lib/utils';

type TextPropsType = {
  children: ReactNode | ReactNode[];
  className?: string;
  /**
   * 넘치면 말줄임한다.
   *
   * 웹의 `line-clamp-*` · `truncate` 대응물이다 — 그 유틸들은 NativeWind 에 없어서
   * RN 내장 prop 을 쓴다.
   */
  numberOfLines?: number;
};

/**
 * 웹 `shared/ui/Text` 의 RN 미러.
 *
 * 팩토리 즉시실행 형태(`Text.sm` 으로 호출)를 웹과 동일하게 유지한다.
 * 화면 이관 시 JSX 를 그대로 옮길 수 있게 하는 것이 이 형태를 유지하는 이유다.
 */
const createText = () => {
  const TextComponent = ({ children, className, numberOfLines }: TextPropsType, size: string) => (
    <RNText className={cn(size, className)} numberOfLines={numberOfLines}>
      {children}
    </RNText>
  );

  return {
    xxs: (props: TextPropsType) => TextComponent(props, 'text-[0.65rem]'),
    xs: (props: TextPropsType) => TextComponent(props, 'text-xs'),
    sm: (props: TextPropsType) => TextComponent(props, 'text-sm'),
    base: (props: TextPropsType) => TextComponent(props, 'text-base'),
    lg: (props: TextPropsType) => TextComponent(props, 'text-lg'),
    xl: (props: TextPropsType) => TextComponent(props, 'text-xl'),
    xxl: (props: TextPropsType) => TextComponent(props, 'text-2xl'),
    xxxl: (props: TextPropsType) => TextComponent(props, 'text-3xl'),
  };
};

export default createText();
