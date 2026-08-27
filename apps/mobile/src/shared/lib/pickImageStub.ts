/**
 * media.pickImage 의 네이티브 응답.
 *
 * 이번 범위에서는 진짜 사진 피커를 붙이지 않는다 —
 * 미디어 권한 선언(AndroidManifest/Info.plist)과 S3 전송이 범위 밖이라
 * 계약이 끝까지 이어지는지만 고정 더미 URI 로 확인한다.
 */
const DUMMY_IMAGE_URI = 'https://via.placeholder.com/300';

/**
 * 웹이 요청한 개수만큼(최대 1장) 더미 URI 를 돌려준다.
 * max 가 0 이하면 아무것도 고르지 않은 것과 같아 빈 목록을 준다.
 */
export function pickImageStub(max: number): { uris: string[] } {
  if (!Number.isFinite(max) || max < 1) {
    return { uris: [] };
  }

  return { uris: [DUMMY_IMAGE_URI] };
}
