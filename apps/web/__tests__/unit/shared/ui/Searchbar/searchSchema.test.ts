import { describe, expect, it } from 'vitest';

import { searchSchema } from '@/shared/ui/Searchbar/validator';

describe('searchSchema', () => {
  it('2자 이상 검색어는 유효성 검사를 통과한다', async () => {
    const result = searchSchema.safeParse({ search: '검색어' });
    expect(result.success).toBe(true);
  });

  it('빈 문자열은 "검색어를 입력해주세요." 오류가 발생한다', async () => {
    const result = searchSchema.safeParse({ search: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('검색어를 입력해주세요.');
    }
  });

  it('1자 검색어는 "검색어는 최소 2자 이상 입력해주세요." 오류가 발생한다', async () => {
    const result = searchSchema.safeParse({ search: '검' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('검색어는 최소 2자 이상 입력해주세요.');
    }
  });

  it('정확히 2자 검색어는 유효성 검사를 통과한다 (경계값)', async () => {
    const result = searchSchema.safeParse({ search: '검색' });
    expect(result.success).toBe(true);
  });
});
