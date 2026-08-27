/**
 * RN 에는 node 의 `process` 타입이 없다 — tsconfig 의 `types` 가 `jest` 만 넣기 때문이다.
 * **런타임에는 존재한다**: RN 이 최소 형태를 폴리필하고 `index.js` 가 앱 시작 시 값을 채운다.
 *
 * `@types/node` 를 넣지 않는다. 그러면 RN 에 없는 node API 까지 타입상 열려
 * 컴파일은 통과하는데 런타임에 터지는 코드가 쓰일 수 있다.
 * **실제로 쓰는 키만** 선언한다.
 */
declare const process: {
  env: {
    /** 백엔드 주소. `index.js` 가 없으면 `http://localhost:8080` 으로 채운다. */
    NEXT_PUBLIC_API_BASE_URL?: string;
    /** 웹뷰가 로드할 웹 주소. 개발: `http://localhost:3000`, 배포: 실제 도메인. */
    NEXT_PUBLIC_WEB_ORIGIN?: string;
  };
};
