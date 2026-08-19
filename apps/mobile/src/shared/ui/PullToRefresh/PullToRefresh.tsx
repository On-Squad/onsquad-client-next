import type { ReactNode } from 'react';
import {
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

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const {
    pullDistance,
    isRefreshing,
    threshold,
    refreshHold,
    gesture,
    onScroll,
  } = usePullToRefresh(onRefresh);

  const offset = isRefreshing ? refreshHold : pullDistance;
  const showSpinner = isRefreshing || pullDistance > 4;

  return (
    <View className="flex-1">
      <View
        pointerEvents="none"
        className="absolute inset-x-0 top-0 items-center justify-end"
        style={{ height: offset }}
      >
        {showSpinner && (
          <View
            className="mb-2"
            style={{
              opacity: isRefreshing ? 1 : Math.min(pullDistance / threshold, 1),
            }}
          >
            <Loader size={LOADER_SIZE} />
          </View>
        )}
      </View>

      <GestureDetector gesture={gesture}>
        <View
          className="flex-1"
          style={{ transform: [{ translateY: offset }] }}
        >
          {children({ onScroll, scrollEventThrottle: SCROLL_EVENT_THROTTLE })}
        </View>
      </GestureDetector>
    </View>
  );
}
