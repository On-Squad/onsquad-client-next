import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Text } from '../Text';

import { HashLoader } from './HashLoader';

/**
 * 웹 `shared/ui/Spinner` 의 RN 미러 — 화면 전체를 덮는 로딩.
 *
 * 웹은 `document.body` 로 포탈해 `fixed inset-0 z-[9999] bg-black/40` 을 깐다.
 * RN 에는 stacking context 문제가 없어 포탈이 필요 없고, 부모를 채우면 같은 결과가 된다.
 *
 * 글자는 웹의 `animate-bounceInOrder`(1초 무한, -3px) 를 한 글자씩 0.2초 늦춰 재생한다.
 */
interface SpinnerProps {
  helperText?: string;
  /** 이 인덱스 앞에서 한 칸 띄운다. 웹과 같다. */
  splitCount?: number;
}

const DEFAULT_HELPER_TEXT = '취미생활의 즐거움';

const DEFAULT_SPLIT_COUNT = 5;

const BOUNCE_DURATION_MS = 1000;

const BOUNCE_DELAY_MS = 200;

const BOUNCE_DISTANCE = -3;

/** 한 글자. 웹의 `animation-delay: i * 0.2s` 를 그대로 옮긴다. */
function BouncingChar({
  char,
  delay,
  hasGap,
}: {
  char: string;
  delay: number;
  hasGap: boolean;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: BOUNCE_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const timer = setTimeout(() => loop.start(), delay);

    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [progress, delay]);

  // 0% · 100% 는 0, 50% 에서 -3px. 웹 keyframes 그대로다.
  const translateY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, BOUNCE_DISTANCE, 0],
  });

  return (
    <Animated.View
      style={{ transform: [{ translateY }], marginLeft: hasGap ? 8 : 0 }}
    >
      <Text.lg className="font-semibold text-primary">{char}</Text.lg>
    </Animated.View>
  );
}

export function Spinner({
  helperText = DEFAULT_HELPER_TEXT,
  splitCount = DEFAULT_SPLIT_COUNT,
}: SpinnerProps) {
  return (
    <View
      style={StyleSheet.absoluteFill}
      className="items-center justify-center bg-black/40"
    >
      <HashLoader />

      <View className="mt-4 flex-row items-center">
        {helperText.split('').map((char, index) => (
          <BouncingChar
            key={`${char}-${index}`}
            char={char}
            delay={index * BOUNCE_DELAY_MS}
            hasGap={index === splitCount}
          />
        ))}
      </View>
    </View>
  );
}
