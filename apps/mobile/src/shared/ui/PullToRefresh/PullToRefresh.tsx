import type { ReactNode } from 'react';
import {
  Animated,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { GestureDetector } from 'react-native-gesture-handler';

import { usePullToRefresh } from '../../lib/usePullToRefresh';
import { Loader } from '../Loader';

/**
 * 웹 `shared/ui/PullToRefresh` 의 RN 미러.
 *
 * 웹과 같은 움직임이다 — **콘텐츠를 당긴 만큼 아래로 밀고**, 그 틈에 `Loader2` 를 띄우며,
 * 스피너의 투명도가 당김 정도(`pullDistance / threshold`)를 따라 올라간다.
 *
 * **당김 중에는 리렌더가 없다.** 콘텐츠 이동도 스피너 위치·투명도도 전부 하나의
 * `Animated.Value` 에서 파생시킨다. 여기서 state 를 쓰면 매 프레임 리렌더가 돌고,
 * render prop 으로 받은 목록까지 통째로 재조정되어 눈에 띄게 버벅인다(실측).
 *
 * 자식이 스크롤 위치를 알려줘야 해서 render prop 으로 `onScroll` 을 내려준다 —
 * 웹은 ScrollContainer 의 ref 를 context 로 받지만 RN 엔 그 컨테이너가 없다.
 */
interface PullToRefreshScrollProps {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle: number;
}

interface PullToRefreshProps {
  onRefresh: () => Promise<unknown> | void;
  children: (scrollProps: PullToRefreshScrollProps) => ReactNode;
}

const SCROLL_EVENT_THROTTLE = 16;

/** 웹 `h-6 w-6`. */
const LOADER_SIZE = 24;

/** 웹 `mb-2`. 스피너와 콘텐츠 윗변 사이 간격. */
const LOADER_GAP = 8;

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const {
    pullAnim,
    isRefreshing,
    isPulling,
    threshold,
    gesture,
    nativeGesture,
    onScroll,
  } = usePullToRefresh(onRefresh);

  return (
    <View className="flex-1">
      {(isPulling || isRefreshing) && (
        <Animated.View
          pointerEvents="none"
          className="absolute inset-x-0 top-0 items-center"
          style={{
            opacity: pullAnim.interpolate({
              inputRange: [0, threshold],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            // 콘텐츠 윗변 바로 위에 붙어 함께 내려온다 — 웹에서 늘어나는 상자의 아래끝과 같은 자리.
            transform: [
              {
                translateY: Animated.subtract(
                  pullAnim,
                  LOADER_SIZE + LOADER_GAP,
                ),
              },
            ],
          }}
        >
          <Loader size={LOADER_SIZE} />
        </Animated.View>
      )}

      <GestureDetector gesture={gesture}>
        <Animated.View
          className="flex-1"
          style={{ transform: [{ translateY: pullAnim }] }}
        >
          {/* 목록 자체를 Native 제스처로 감싸야 위의 pan 이 스크롤과 관계를 맺을 수 있다. */}
          <GestureDetector gesture={nativeGesture}>
            {children({ onScroll, scrollEventThrottle: SCROLL_EVENT_THROTTLE })}
          </GestureDetector>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
