/**
 * API 클라이언트가 "지금 브라우저인가"를 판정한다.
 *
 * `typeof window !== 'undefined'` 로 판정하면 **React Native 에서 틀린다** —
 * RN 에도 `window` 전역이 있다. 그대로 두면 RN 이 존재하지 않는 BFF(`/api/bff`)를
 * 호출하고, 웹 전용 토스트 모듈을 번들로 끌고 들어온다.
 *
 * `document` 는 브라우저에만 있으므로 세 런타임을 정확히 가른다.
 *
 * | 런타임 | window | document | 판정 |
 * | --- | --- | --- | --- |
 * | 브라우저 | ✓ | ✓ | true |
 * | Next 서버 | ✗ | ✗ | false |
 * | React Native | ✓ | ✗ | **false** |
 */
const detect = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';

let isBrowser: boolean | null = null;

/**
 * 판정을 명시적으로 덮어쓴다.
 * 자동 판정이 애매한 환경(폴리필이 `document` 를 흉내내는 경우 등)에서 플랫폼이 직접 정한다.
 */
export const setBrowserRuntime = (value: boolean | null) => {
  isBrowser = value;
};

/** 브라우저 런타임인가. 명시적으로 설정된 값이 있으면 그것을, 없으면 자동 판정을 쓴다. */
export const getIsBrowserRuntime = (): boolean => isBrowser ?? detect();
