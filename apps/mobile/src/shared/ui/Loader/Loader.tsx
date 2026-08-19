import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import { Loader2 } from 'lucide-react-native';

/**
 * 웹이 인라인 로딩에 쓰는 `<Loader2 className="animate-spin" />` 의 RN 미러.
 *
 * 무한스크롤·당김새로고침·버튼 로딩이 모두 이 아이콘을 쓴다.
 * **RN 내장 `ActivityIndicator` 를 쓰지 않는다** — OS 기본 스피너라 웹과 모양이 다르다.
 *
 * lucide 는 색·크기를 prop 으로 받는다(className 대상이 아니다) — 토큰 예외.
 */
interface LoaderProps {
  /** 웹 `h-6 w-6` = 24. 버튼 안에서는 `h-4 w-4` = 16. */
  size?: number;
  /** 웹 `text-primary500`. 버튼처럼 글자색을 따라야 하는 자리는 호출부가 넘긴다. */
  color?: string;
}

const DEFAULT_SIZE = 24;

const PRIMARY_500 = '#FF7800';

/** tailwindcss `animate-spin` 과 같다 — 1초, 등속, 무한. */
const SPIN_DURATION_MS = 1000;

export function Loader({
  size = DEFAULT_SIZE,
  color = PRIMARY_500,
}: LoaderProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: SPIN_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => loop.stop();
  }, [progress]);

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Loader2 size={size} color={color} />
    </Animated.View>
  );
}
