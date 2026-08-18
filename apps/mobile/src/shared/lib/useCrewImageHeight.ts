import { useWindowDimensions } from 'react-native';

/**
 * 웹 `--app-header-height` = `calc(3.5rem + env(safe-area-inset-top))` 의 3.5rem 부분.
 * RN 은 safe-area 를 네이티브 헤더가 이미 먹으므로 window 높이에 포함되지 않는다.
 */
const APP_HEADER_HEIGHT = 56;

/** 웹의 `50dvh` */
const VIEWPORT_RATIO = 0.5;

/**
 * 크루 대표 이미지 높이.
 *
 * 웹은 `h-[calc(50dvh-var(--app-header-height))]` 이다 — 크루 상세와 크루 홈이 같은 값을 쓴다.
 * RN 에 `dvh` 가 없어 `useWindowDimensions` 로 같은 식을 계산한다.
 *
 * 고정값(`h-48`·`h-64`)을 쓰면 화면 크기에 따라 웹과 크게 어긋난다 —
 * Pixel 에뮬레이터(914dp)에서 웹 401dp vs `h-48` 192dp 로 절반도 안 됐다.
 */
export const useCrewImageHeight = (): number => {
  const { height } = useWindowDimensions();

  return height * VIEWPORT_RATIO - APP_HEADER_HEIGHT;
};
