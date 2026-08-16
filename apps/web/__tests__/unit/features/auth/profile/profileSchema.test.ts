import { describe, expect, it } from 'vitest';

import { profileSchema } from '@/features/auth/profile/model/profileSchema';

const validProfile = {
  nickname: '테스트유저',
  introduce: '안녕하세요, 테스트 유저입니다.',
  kakaoLink: 'https://open.kakao.com/test',
  mbti: 'ISTJ',
  address: '서울시 강남구',
  addressDetail: '101호',
};

describe('profileSchema', () => {
  it('유효한 입력은 검증을 통과한다', () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('addressDetail이 없어도 검증을 통과한다', () => {
    const { addressDetail: _, ...withoutDetail } = validProfile;

    expect(profileSchema.safeParse(withoutDetail).success).toBe(true);
  });

  it('profileImage가 없어도 검증을 통과한다', () => {
    expect(profileSchema.safeParse({ ...validProfile, profileImage: undefined }).success).toBe(true);
  });

  it('profileImageFile이 없어도 검증을 통과한다', () => {
    expect(profileSchema.safeParse({ ...validProfile, profileImageFile: undefined }).success).toBe(true);
  });

  describe('nickname 필드', () => {
    it('닉네임이 비어있으면 required 에러가 발생한다', () => {
      const result = profileSchema.safeParse({ ...validProfile, nickname: '' });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('닉네임을 입력해주세요.');
    });
  });

  describe('introduce 필드', () => {
    it('소개가 비어있으면 required 에러가 발생한다', () => {
      const result = profileSchema.safeParse({ ...validProfile, introduce: '' });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('멋진 소개를 입력해주세요.');
    });
  });

  describe('kakaoLink 필드', () => {
    it('카카오 링크가 비어있으면 required 에러가 발생한다', () => {
      const result = profileSchema.safeParse({ ...validProfile, kakaoLink: '' });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('오픈 카톡 프로필 링크를 입력해주세요.');
    });
  });

  describe('mbti 필드', () => {
    it('유효한 MBTI 값이면 통과한다', () => {
      expect(profileSchema.safeParse({ ...validProfile, mbti: 'INFP' }).success).toBe(true);
    });

    it('유효하지 않은 MBTI 값이면 에러가 발생한다', () => {
      const result = profileSchema.safeParse({ ...validProfile, mbti: 'XXXX' });

      expect(result.success).toBe(false);
      // yup 의 'must be one of' 는 라이브러리 자동생성 문구라 zod 에서 재현할 수 없다.
      // 대신 에러가 어느 필드에 붙는지를 단언한다 — 전환 전후로 같아야 하는 계약이다.
      if (!result.success) expect(result.error.issues[0].path[0]).toBe('mbti');
    });

    it('MBTI가 undefined이면 required 에러가 발생한다', () => {
      const result = profileSchema.safeParse({ ...validProfile, mbti: undefined });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('MBTI를 선택해주세요.');
    });

    it('MBTI를 선택하지 않으면 에러가 발생한다', () => {
      const result = profileSchema.safeParse({ ...validProfile, mbti: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('MBTI를 선택해주세요.');
      }
    });
  });

  describe('address 필드', () => {
    it('주소가 비어있으면 required 에러가 발생한다', () => {
      const result = profileSchema.safeParse({ ...validProfile, address: '' });

      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe('주소를 입력해주세요.');
    });
  });
});
