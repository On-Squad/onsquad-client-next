import { describe, expect, it } from 'vitest';

import { resolveMbtiDisplay } from '../../../../src/features/crew/manage/members/lib/resolveMbtiDisplay';

/**
 * 프로필 시트 MBTI 표시 문구 판정.
 *
 * 서버 응답 `member.mbti` 는 `Mbti | ''` 타입이다.
 * 빈 문자열일 때 '신비주의'가 나오는지, 값이 있을 때 그 값이 나오는지를 검증한다.
 *
 * 자가 검증:
 *   `resolveMbtiDisplay` 에서 `'신비주의'` 를 `'미상'` 으로 바꾸면
 *   "MBTI가 빈 문자열이면 '신비주의'를 표시한다" 테스트가 빨간불이 된다.
 *   확인 후 원복함.
 */
describe('프로필 시트 MBTI 표시 문구', () => {
  it("MBTI가 유효한 값이면 그 값을 그대로 표시한다", () => {
    expect(resolveMbtiDisplay('ENFJ')).toBe('ENFJ');
  });

  it("MBTI가 빈 문자열이면 '신비주의'를 표시한다", () => {
    expect(resolveMbtiDisplay('')).toBe('신비주의');
  });

  it("모든 MBTI 유형에 대해 해당 값을 그대로 반환한다", () => {
    const mbtiTypes = [
      'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
      'ISTP', 'ISFP', 'INFP', 'INTP',
      'ESTP', 'ESFP', 'ENFP', 'ENTP',
      'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
    ] as const;

    for (const mbti of mbtiTypes) {
      expect(resolveMbtiDisplay(mbti)).toBe(mbti);
    }
  });
});
