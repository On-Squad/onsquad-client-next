import type { CrewHomeInfoResponseProps } from '../api/crewHomeInfoGetFetch';

/**
 * 크루 홈 응답의 data 부분. 화면들이 이걸 잘라 쓴다.
 *
 * 웹은 전역 타입 `PropType<T, K>` 를 쓰지만 RN tsconfig 에는 그 전역이 없다.
 * 표준 인덱스 접근으로 같은 의미를 만든다.
 */
export type CrewHomeData = CrewHomeInfoResponseProps['data'];
