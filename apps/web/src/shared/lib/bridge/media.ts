import { call } from '@onsquad/bridge/web';

import { captureError } from '@/shared/lib/observability';

/**
 * 브릿지를 통해 이미지 URI 목록을 가져온다.
 * can('media.pickImage') 를 확인한 뒤 호출한다 — 브릿지 없는 환경에서는 파일 인풋이 대신한다.
 * 실패 시 빈 배열을 반환하되 오류 흔적은 남긴다.
 */
export const pickImage = (max: number): Promise<string[]> =>
  call('media.pickImage', { max })
    .then((result) => result.uris)
    .catch((error) => {
      captureError(error);
      return [];
    });
