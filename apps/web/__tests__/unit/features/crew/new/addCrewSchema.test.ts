import { describe, expect, it } from 'vitest';

import { addCrewSchema } from '@/features/crew/new/ui/validator';

const validCrew = {
  name: '테스트 크루',
  introduce: '크루 소개입니다.',
  detail: '크루 상세 정보입니다.',
  kakaoLink: 'https://open.kakao.com/test',
  hashtags: ['활발한'],
  file: null,
};

describe('addCrewSchema', () => {
  it('유효한 입력은 검증을 통과한다', async () => {
    expect(addCrewSchema.safeParse(validCrew).success).toBe(true);
  });

  describe('name 필드', () => {
    it('name이 비어있으면 required 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, name: '' });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('사용하실 크루 이름을 입력해주세요.');
    });

    it('name이 15자를 초과하면 max 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, name: '가'.repeat(16) });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('크루 이름은 최대 15자 입니다.');
    });

    it('name이 정확히 15자이면 통과한다', async () => {
      expect(addCrewSchema.safeParse({ ...validCrew, name: '가'.repeat(15) }).success).toBe(true);
    });
  });

  describe('introduce 필드', () => {
    it('introduce가 비어있으면 required 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, introduce: '' });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('크루의 멋진 소개를 적어주세요.');
    });

    it('introduce가 150자를 초과하면 max 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, introduce: '가'.repeat(151) });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('크루소개는 최대 150자로 입력해주세요.');
    });

    it('introduce가 정확히 150자이면 통과한다', async () => {
      expect(addCrewSchema.safeParse({ ...validCrew, introduce: '가'.repeat(150) }).success).toBe(true);
    });
  });

  describe('detail 필드', () => {
    it('detail이 비어있으면 required 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, detail: '' });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('신청자가 볼 크루에 대한 정보를 알려주세요.');
    });

    it('detail이 150자를 초과하면 max 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, detail: '가'.repeat(151) });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('크루 상세정보는 최대 150자로 입력해주세요.');
    });

    it('detail이 정확히 150자이면 통과한다', async () => {
      expect(addCrewSchema.safeParse({ ...validCrew, detail: '가'.repeat(150) }).success).toBe(true);
    });
  });

  describe('kakaoLink 필드', () => {
    it('kakaoLink가 비어있으면 required 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, kakaoLink: '' });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('소통방 링크를 입력해주세요.');
    });

    it('kakaoLink가 URL 형식이 아니면 matches 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, kakaoLink: 'not-a-url' });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('유효한 URL을 입력해주세요.');
    });

    it('http로 시작하는 URL도 통과한다', async () => {
      expect(addCrewSchema.safeParse({ ...validCrew, kakaoLink: 'http://open.kakao.com/test' }).success).toBe(true);
    });
  });

  describe('hashtags 필드', () => {
    it('hashtags가 빈 배열이면 min 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, hashtags: [] });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('최소 1개의 해시태그가 필요합니다.');
    });

    it('hashtags가 5개를 초과하면 max 에러가 발생한다', async () => {
      const result = addCrewSchema.safeParse({ ...validCrew, hashtags: ['a', 'b', 'c', 'd', 'e', 'f'] });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('해시태그는 최대 5개입니다.');
    });

    it('hashtags가 정확히 5개이면 통과한다', async () => {
      expect(addCrewSchema.safeParse({ ...validCrew, hashtags: ['a', 'b', 'c', 'd', 'e'] }).success).toBe(true);
    });
  });
});
