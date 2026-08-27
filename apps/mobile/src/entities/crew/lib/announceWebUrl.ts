import { getWebOrigin } from '../../../shared/config/webOrigin';

interface AnnounceDetailUrlParams {
  crewId: number;
  announceId: number;
}

/**
 * 공지 상세 웹뷰가 로드할 주소.
 *
 * 웹의 `/crews/{crewId}/announce/{announceId}` 와 **같은 경로**다 —
 * 앱 전용 경로를 따로 두면 브라우저에서 열리지 않는 주소가 생긴다.
 */
export const announceDetailUrl = ({ crewId, announceId }: AnnounceDetailUrlParams): string =>
  `${getWebOrigin()}/crews/${crewId}/announce/${announceId}`;

/** 공지 작성 웹뷰가 로드할 주소. */
export const announceWriteUrl = ({ crewId }: { crewId: number }): string =>
  `${getWebOrigin()}/crews/${crewId}/announce/write`;

/** 공지 수정 웹뷰가 로드할 주소. */
export const announceEditUrl = ({ crewId, announceId }: AnnounceDetailUrlParams): string =>
  `${getWebOrigin()}/crews/${crewId}/announce/${announceId}/edit`;
