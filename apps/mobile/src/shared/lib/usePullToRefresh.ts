import { useMemo, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

import { Gesture } from 'react-native-gesture-handler';

/**
 * 웹 `shared/lib/hooks/usePullToRefresh` 의 RN 판.
 *
 * **상수 4개는 웹과 같은 값이다** — 당김 감도가 두 앱에서 달라지면 안 된다.
 *
 * **왜 PanResponder 가 아니라 gesture-handler 인가**: Android 의 네이티브 ScrollView 는
 * 세로 드래그가 시작되면 맨 위에서 더 올라갈 수 없을 때조차 터치를 가로채고
 * JS 쪽에 `touchCancel` 을 보낸다. 그래서 PanResponder 는 당김을 아예 못 잡는다(실측 — iOS 만 됐다).
 * gesture-handler 는 자체 터치 파이프라인에서 네이티브 스크롤과 협상하므로 두 OS 가 같아진다.
 *
 * **RN 내장 `RefreshControl` 을 쓰지 않는 이유**: 스피너 모양을 바꿀 수 없어
 * 웹의 `Loader2` 대신 OS 기본 아이콘이 뜬다.
 */
const THRESHOLD = 70; // 새로고침 발동 임계 당김 거리(px)

const MAX_PULL = 110; // 최대 당김 거리

const RESISTANCE = 0.5; // 당김 저항(실제 이동 대비 표시 비율)

const REFRESH_HOLD = 44; // 새로고침 중 스피너를 붙잡아둘 높이(px)

/** 세로로 이만큼 움직여야 당김으로 본다. 목록의 세로 스크롤을 뺏지 않기 위한 값이다. */
const CLAIM_DISTANCE = 8;

export const usePullToRefresh = (onRefresh: () => Promise<unknown> | void) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /** 목록이 맨 위에 있을 때만 당길 수 있다. 제스처를 켜고 끄는 스위치라 state 로 둔다. */
  const [isAtTop, setIsAtTop] = useState(true);
  const atTop = useRef(true);
  const pull = useRef(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = event.nativeEvent.contentOffset.y <= 0;

    // 맨 위인지 아닌지가 바뀔 때만 리렌더한다 — 스크롤 프레임마다 setState 하지 않는다.
    if (next !== atTop.current) {
      atTop.current = next;
      setIsAtTop(next);
    }
  };

  const gesture = useMemo(() => {
    const setPull = (value: number) => {
      pull.current = value;
      setPullDistance(value);
    };

    return (
      Gesture.Pan()
        .enabled(isAtTop)
        // 아래로 CLAIM_DISTANCE 넘게 끌면 당김, 위로 그만큼 끌면 실패시켜 스크롤에 넘긴다.
        .activeOffsetY(CLAIM_DISTANCE)
        .failOffsetY(-CLAIM_DISTANCE)
        // worklets 가 깔려 있으면 콜백이 UI 스레드 worklet 이 된다.
        // 여기서는 React state 를 만지므로 JS 스레드로 돌려야 한다.
        .runOnJS(true)
        .onUpdate(event => {
          if (event.translationY <= 0) {
            setPull(0);

            return;
          }

          setPull(Math.min(event.translationY * RESISTANCE, MAX_PULL));
        })
        .onEnd(() => {
          if (pull.current < THRESHOLD) {
            setPull(0);

            return;
          }

          setIsRefreshing(true);
          setPull(REFRESH_HOLD);

          void Promise.resolve(onRefresh()).finally(() => {
            setIsRefreshing(false);
            setPull(0);
          });
        })
    );
  }, [isAtTop, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    threshold: THRESHOLD,
    refreshHold: REFRESH_HOLD,
    gesture,
    onScroll,
  };
};
