import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

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
 * **왜 당김 거리가 state 가 아니라 `Animated.Value` 인가**: state 로 두면 손가락이 움직이는
 * 매 프레임마다 리렌더가 돌고, render prop 으로 넘긴 목록까지 통째로 재조정된다.
 * 그게 당김·무한스크롤이 버벅이던 실제 원인이다(실측). `Animated.Value` 는 리렌더 없이
 * 네이티브 쪽 transform 만 갱신한다.
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

/** 이만큼 당겨야 스피너를 붙인다. 웹의 `pullDistance > 4` 와 같다. */
const SPINNER_REVEAL = 4;

/** 손을 뗐을 때 되돌아가는 시간. 웹 `transition: transform 0.2s ease`. */
const SETTLE_MS = 200;

export const usePullToRefresh = (onRefresh: () => Promise<unknown> | void) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  /** 스피너를 트리에 붙일지. 당김 한 번에 두 번만 바뀐다 — 프레임마다 바뀌지 않는다. */
  const [isPulling, setIsPulling] = useState(false);

  /** 목록이 맨 위에 있을 때만 당길 수 있다. 제스처를 켜고 끄는 스위치라 state 로 둔다. */
  const [isAtTop, setIsAtTop] = useState(true);
  const atTop = useRef(true);

  const pullAnim = useRef(new Animated.Value(0)).current;
  const pull = useRef(0);
  const pulling = useRef(false);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = event.nativeEvent.contentOffset.y <= 0;

    // 맨 위인지 아닌지가 바뀔 때만 리렌더한다 — 스크롤 프레임마다 setState 하지 않는다.
    if (next !== atTop.current) {
      atTop.current = next;
      setIsAtTop(next);
    }
  };

  /**
   * 목록의 네이티브 스크롤을 제스처로 노출시킨다.
   *
   * **iOS 때문에 필요하다.** UIKit 은 인식기끼리 관계를 선언하지 않으면
   * 자식(UIScrollView)의 pan 이 먼저 이기고 부모의 pan 은 취소된다 —
   * 그래서 당김이 아예 안 잡혔다(실측: Android 는 되는데 iOS 만 안 됨).
   * 아래 `blocksExternalGesture` 로 "스크롤은 이 당김이 실패할 때까지 기다린다"고 못박는다.
   *
   * **`runOnJS(true)` 를 빼면 iOS 가 죽는다.** RNGH 는 콜백이 하나도 없는 제스처를
   * "전부 worklet" 으로 보고 Reanimated 로 이벤트를 보내는데, 이 저장소엔 Reanimated 이 없다
   * (worklets 만 있다) — `Unable to find module for ReanimatedModule` 로 크래시난다(실측).
   */
  const nativeGesture = useMemo(() => Gesture.Native().runOnJS(true), []);

  const gesture = useMemo(() => {
    const setPull = (value: number) => {
      pull.current = value;
      pullAnim.setValue(value);

      const next = value > SPINNER_REVEAL;

      if (next !== pulling.current) {
        pulling.current = next;
        setIsPulling(next);
      }
    };

    const settleTo = (value: number) => {
      pull.current = value;

      Animated.timing(pullAnim, {
        toValue: value,
        duration: SETTLE_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    };

    const release = () => {
      pulling.current = false;
      setIsPulling(false);
      settleTo(0);
    };

    return (
      Gesture.Pan()
        .enabled(isAtTop)
        .blocksExternalGesture(nativeGesture)
        // 아래로 CLAIM_DISTANCE 넘게 끌면 당김, 위로 그만큼 끌면 실패시켜 스크롤에 넘긴다.
        .activeOffsetY(CLAIM_DISTANCE)
        .failOffsetY(-CLAIM_DISTANCE)
        // worklets 가 깔려 있으면 콜백이 UI 스레드 worklet 이 된다.
        // 여기서는 React state·Animated 를 만지므로 JS 스레드로 돌려야 한다.
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
            release();

            return;
          }

          setIsRefreshing(true);
          settleTo(REFRESH_HOLD);

          void Promise.resolve(onRefresh()).finally(() => {
            setIsRefreshing(false);
            release();
          });
        })
    );
  }, [isAtTop, onRefresh, nativeGesture, pullAnim]);

  return {
    pullAnim,
    isRefreshing,
    isPulling,
    threshold: THRESHOLD,
    gesture,
    nativeGesture,
    onScroll,
  };
};
