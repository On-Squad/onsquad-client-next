import { describe, expect, it } from 'vitest';

import { createSquadSchema } from '@/features/squad/new/ui/validator';

const validSquad = {
  title: '스쿼드 제목',
  content: '스쿼드 내용입니다.',
  capacity: '5',
  address: '서울시 강남구',
  addressDetail: '101호',
  categories: ['운동'],
  kakaoLink: 'https://open.kakao.com/test',
  discordLink: '',
};

describe('createSquadSchema', () => {
  it('유효한 입력은 검증을 통과한다', () => {
    expect(createSquadSchema.safeParse(validSquad).success).toBe(true);
  });

  it('discordLink가 빈 문자열이면 통과한다 (excludeEmptyString: true)', () => {
    expect(createSquadSchema.safeParse({ ...validSquad, discordLink: '' }).success).toBe(true);
  });

  describe('title 필드', () => {
    it('title이 비어있으면 required 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, title: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('제목을 입력해주세요');
      }
    });
  });

  describe('content 필드', () => {
    it('content가 비어있으면 required 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, content: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('내용을 입력해주세요');
      }
    });
  });

  describe('capacity 필드', () => {
    it('capacity가 비어있으면 required 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, capacity: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('모집 인원을 입력해주세요');
      }
    });

    it('capacity가 0이면 min-capacity 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, capacity: '0' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('모집 인원은 1명 이상이어야 합니다');
      }
    });

    it('capacity가 음수이면 min-capacity 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, capacity: '-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('모집 인원은 1명 이상이어야 합니다');
      }
    });

    it('capacity가 1이면 통과한다', () => {
      expect(createSquadSchema.safeParse({ ...validSquad, capacity: '1' }).success).toBe(true);
    });
  });

  describe('address 필드', () => {
    it('address가 비어있으면 required 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, address: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('주소를 검색해주세요');
      }
    });
  });

  describe('addressDetail 필드', () => {
    it('addressDetail이 비어있으면 required 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, addressDetail: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('상세 주소를 입력해주세요');
      }
    });
  });

  describe('categories 필드', () => {
    it('categories가 빈 배열이면 min 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, categories: [] });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('카테고리를 선택해주세요');
      }
    });

    it('categories가 5개를 초과하면 max 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, categories: ['a', 'b', 'c', 'd', 'e', 'f'] });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('최대 5개까지 선택할 수 있어요');
      }
    });

    it('categories가 정확히 5개이면 통과한다', () => {
      expect(createSquadSchema.safeParse({ ...validSquad, categories: ['a', 'b', 'c', 'd', 'e'] }).success).toBe(
        true,
      );
    });
  });

  describe('kakaoLink 필드', () => {
    it('kakaoLink가 비어있으면 required 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, kakaoLink: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('카카오 오픈채팅 링크를 입력해주세요');
      }
    });

    it('kakaoLink가 URL 형식이 아니면 matches 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, kakaoLink: 'not-a-url' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('유효한 URL을 입력해주세요');
      }
    });
  });

  describe('discordLink 필드', () => {
    it('discordLink가 URL 형식이 아닌 일반 문자열이면 matches 에러가 발생한다', () => {
      const result = createSquadSchema.safeParse({ ...validSquad, discordLink: 'not-a-url' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('유효한 URL을 입력해주세요');
      }
    });

    it('discordLink가 유효한 URL이면 통과한다', () => {
      expect(createSquadSchema.safeParse({ ...validSquad, discordLink: 'https://discord.gg/test' }).success).toBe(
        true,
      );
    });
  });
});
