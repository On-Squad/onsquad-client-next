import type { Mbti } from '../../../../../shared/api/model';

/**
 * 프로필 시트에 보여줄 MBTI 문구를 결정한다.
 *
 * 서버가 빈 문자열을 내려보내는 경우 '신비주의'를 표시한다.
 * 웹 `CrewMemberList` 의 동일한 fallback 표현과 같다.
 */
export const resolveMbtiDisplay = (mbti: Mbti | ''): string => mbti || '신비주의';
