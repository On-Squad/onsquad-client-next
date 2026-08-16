import { describe, expect, it } from 'vitest';

import { announceSchema } from '@/features/crew/announce/model/announceSchema';

const validAnnounce = {
  title: '공지사항 제목',
  content: '공지사항 내용입니다.',
};

describe('announceSchema', () => {
  it('유효한 입력은 검증을 통과한다', () => {
    const result = announceSchema.safeParse(validAnnounce);

    expect(result.success).toBe(true);
  });

  describe('title 필드', () => {
    it('title이 비어있으면 required 에러가 발생한다', () => {
      const result = announceSchema.safeParse({ ...validAnnounce, title: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('제목을 입력해주세요.');
      }
    });
  });

  describe('content 필드', () => {
    it('content가 비어있으면 required 에러가 발생한다', () => {
      const result = announceSchema.safeParse({ ...validAnnounce, content: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('공지사항 내용을 입력해주세요.');
      }
    });
  });
});
