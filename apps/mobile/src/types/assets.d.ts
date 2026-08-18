/**
 * `react-native-svg-transformer` 가 svg 를 RN 컴포넌트로 바꿔주지만,
 * 타입스크립트는 그 사실을 모른다. 이 선언이 그걸 알려준다.
 */
declare module '*.svg' {
  import type { FC } from 'react';
  import type { SvgProps } from 'react-native-svg';

  const content: FC<SvgProps>;

  export default content;
}

/**
 * 이미지 에셋. RN 은 `require`/`import` 결과를 `Image` 의 `source` 로 그대로 받는다.
 * 숫자(에셋 레지스트리 id)라 `ImageSourcePropType` 과 호환된다.
 */
declare module '*.png' {
  const content: number;

  export default content;
}
