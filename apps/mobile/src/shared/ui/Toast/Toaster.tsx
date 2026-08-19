import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Text } from '../Text';

import { subscribeToast } from './toast';

/** 웹 `max-w-[90vw]`. vw 는 NativeWind 에 없어서 실제 창 너비로 계산한다. */
const MAX_WIDTH_RATIO = 0.9;

/** 웹 마크업엔 없는 RN 추가분. 화면 한가운데서 툭 나타났다 사라지면 오작동처럼 보인다. */
const FADE_MS = 200;

/**
 * 토스트 호스트. 앱 트리 **맨 마지막**에 한 번만 마운트한다(= 웹 `z-50` 대응).
 *
 * 웹 마크업:
 * `fixed top-1/2 left-1/2 z-50 w-max max-w-[90vw] -translate-x-1/2 -translate-y-1/2
 *  rounded-lg bg-black/70 px-8 py-4 text-center text-base text-white`
 *
 * `-translate-*` 로 하는 정중앙 정렬은 RN 에서 화면을 덮는 컨테이너의
 * `items-center justify-center` 로 같은 결과를 낸다.
 */
export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  useEffect(
    () =>
      subscribeToast((next) => {
        if (next === null) {
          // 사라지는 동안에도 글자가 남아 있어야 하므로 애니메이션이 끝난 뒤에 비운다.
          Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(({ finished }) => {
            if (finished) setMessage(null);
          });

          return;
        }

        setMessage(next);
        Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
      }),
    [opacity],
  );

  if (message === null) return null;

  return (
    // 1.5초 동안 화면 한가운데의 터치를 먹으면 안 된다.
    <View pointerEvents="none" style={StyleSheet.absoluteFill} className="items-center justify-center">
      <Animated.View
        accessibilityLiveRegion="polite"
        style={{ opacity, maxWidth: width * MAX_WIDTH_RATIO }}
        className="rounded-lg bg-black/70 px-8 py-4"
      >
        <Text.base className="text-center text-white">{message}</Text.base>
      </Animated.View>
    </View>
  );
}
