/**
 * 웹뷰가 로드할 웹 주소.
 *
 * 개발은 `http://localhost:3000`, 배포는 실제 도메인이다 —
 * `index.js` 가 `NEXT_PUBLIC_WEB_ORIGIN` 을 채우지 못했을 때만 기본값으로 떨어진다.
 * (`NEXT_PUBLIC_*` 는 Next 빌드타임 치환값이라 Metro 번들에는 그대로 존재하지 않는다)
 */
const DEV_WEB_ORIGIN = 'http://localhost:3000';

/** 끝의 `/` 는 경로를 이어 붙일 때 `//` 가 되므로 떼어낸다. */
const stripTrailingSlash = (origin: string) => origin.replace(/\/+$/, '');

export const getWebOrigin = (): string => stripTrailingSlash(process.env.NEXT_PUBLIC_WEB_ORIGIN || DEV_WEB_ORIGIN);
