const MAX_BADGE_COUNT = 5;

/**
 * 안읽음 개수를 벨 배지 표시 문자열로 변환한다.
 * - 0: 빈 문자열 (배지 없음)
 * - 1~4: 숫자 그대로
 * - 5 이상: '5+'
 */
export function formatUnreadBadge(count: number): string {
  if (count <= 0) return '';
  if (count < MAX_BADGE_COUNT) return String(count);
  return `${MAX_BADGE_COUNT}+`;
}
