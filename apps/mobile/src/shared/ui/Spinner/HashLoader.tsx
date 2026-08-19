import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

/**
 * 웹 `react-spinners` 의 `HashLoader` 를 RN 으로 옮긴 것.
 *
 * 웹은 span 2개 + `box-shadow` 로 **막대 4개**를 그린다(그림자가 복제본이다).
 * RN 에는 box-shadow 로 도형을 복제하는 방법이 없어서 **막대 4개를 직접 그린다.**
 * 키프레임·좌표·색은 `node_modules/react-spinners/HashLoader.js` 의 계산식 그대로다.
 *
 *   thickness = size / 5      lat = (size - thickness) / 2      offset = lat - thickness
 *   0% → 35% → 70% → 100%     2초 무한 반복      래퍼는 165도 기울어져 있다
 */
interface HashLoaderProps {
  /** 웹 Spinner 가 넘기는 값과 같다. */
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 40;

/** 웹 Spinner 가 하드코딩한 값. 토큰(primary500 #FF7800)과 미묘하게 다르지만 웹을 따른다. */
const DEFAULT_COLOR = '#F87315';

/** 웹은 before 그룹에만 0.75 알파를 준다. */
const DIMMED_ALPHA = 0.75;

const DURATION_MS = 2000;

const KEYFRAMES = [0, 0.35, 0.7, 1];

export function HashLoader({
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
}: HashLoaderProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION_MS,
        easing: Easing.linear,
        // width·height 를 애니메이션하므로 네이티브 드라이버를 못 쓴다(레이아웃 속성).
        useNativeDriver: false,
      }),
    );

    loop.start();

    return () => loop.stop();
  }, [progress]);

  const thickness = size / 5;
  const lat = (size - thickness) / 2;
  const offset = lat - thickness;

  /** 0%→35%→70%→100% 사이를 잇는다. */
  const track = (outputRange: number[]) =>
    progress.interpolate({ inputRange: KEYFRAMES, outputRange });

  // before 그룹: 가로로 늘어난다.
  const barWidth = track([thickness, size, thickness, thickness]);
  const beforeX1 = track([lat, 0, -lat, lat]);
  const beforeX2 = track([-lat, 0, lat, -lat]);

  // after 그룹: 세로로 늘어난다.
  const barHeight = track([thickness, size, thickness, thickness]);
  const afterY1 = track([lat, 0, -lat, lat]);
  const afterY2 = track([-lat, 0, lat, -lat]);

  const base = {
    position: 'absolute' as const,
    borderRadius: size / 10,
  };

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '165deg' }],
      }}
    >
      <Animated.View
        style={[
          base,
          {
            width: barWidth,
            height: thickness,
            backgroundColor: color,
            opacity: DIMMED_ALPHA,
            transform: [{ translateX: beforeX1 }, { translateY: -offset }],
          },
        ]}
      />
      <Animated.View
        style={[
          base,
          {
            width: barWidth,
            height: thickness,
            backgroundColor: color,
            opacity: DIMMED_ALPHA,
            transform: [{ translateX: beforeX2 }, { translateY: offset }],
          },
        ]}
      />

      <Animated.View
        style={[
          base,
          {
            width: thickness,
            height: barHeight,
            backgroundColor: color,
            transform: [{ translateX: offset }, { translateY: afterY1 }],
          },
        ]}
      />
      <Animated.View
        style={[
          base,
          {
            width: thickness,
            height: barHeight,
            backgroundColor: color,
            transform: [{ translateX: -offset }, { translateY: afterY2 }],
          },
        ]}
      />
    </View>
  );
}
