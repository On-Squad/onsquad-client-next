import { describe, expect, it } from 'vitest';

import { joinSchema } from '@/features/auth/join/ui/validator';

const validJoin = {
  email: 'test@example.com',
  authCode: '12345678',
  password: 'Password1!',
  passwordConfirm: 'Password1!',
  nickname: '테스트유저',
  address: '서울시 강남구',
  addressDetail: '101호',
};

describe('joinSchema', () => {
  it('유효한 입력은 검증을 통과한다', () => {
    expect(joinSchema.safeParse(validJoin).success).toBe(true);
  });

  it('addressDetail이 없어도 검증을 통과한다', () => {
    const { addressDetail: _, ...withoutDetail } = validJoin;

    expect(joinSchema.safeParse(withoutDetail).success).toBe(true);
  });

  describe('email 필드', () => {
    it('이메일이 비어있으면 required 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, email: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('이메일을 입력해주세요,');
      }
    });

    it('이메일 형식이 올바르지 않으면 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, email: 'invalid-email' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('이메일 형식에 맞지 않습니다.');
      }
    });
  });

  describe('authCode 필드', () => {
    it('인증코드가 비어있으면 required 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, authCode: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('이메일 인증을 진행해주세요.');
      }
    });

    it('인증코드가 8자 미만이면 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, authCode: '1234567' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('인증번호는 최소 8자리입니다.');
      }
    });

    it('인증코드가 정확히 8자이면 통과한다', () => {
      expect(joinSchema.safeParse({ ...validJoin, authCode: '12345678' }).success).toBe(true);
    });
  });

  describe('password 필드', () => {
    it('비밀번호가 비어있으면 required 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, password: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('비밀번호를 입력해주세요.');
      }
    });

    it('비밀번호가 패턴에 맞지 않으면 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, password: 'password1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('영문, 숫자, 특수문자 1자를 포함한 8자리 이상입니다.');
      }
    });
  });

  describe('passwordConfirm 필드', () => {
    it('비밀번호 확인이 비어있으면 불일치 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, passwordConfirm: '' });

      expect(result.success).toBe(false);
      // passwordConfirm 이 비면 필드 레벨 required 체크가 먼저 issues[0] 을 채운다.
      // 교차 필드 refine 은 그 뒤에 실행되어 issues 배열 어딘가에 붙으므로 배열 전체에서 찾는다.
      if (!result.success) {
        expect(result.error.issues.map((issue) => issue.message)).toContain('비밀번호가 일치하지 않습니다.');
      }
    });

    it('비밀번호와 비밀번호 확인이 다르면 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, passwordConfirm: 'Different1!' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('비밀번호가 일치하지 않습니다.');
        expect(result.error.issues[0].path[0]).toBe('passwordConfirm');
      }
    });
  });

  describe('nickname 필드', () => {
    it('닉네임이 비어있으면 required 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, nickname: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('닉네임을 입력해주세요.');
      }
    });
  });

  describe('address 필드', () => {
    it('주소가 비어있으면 required 에러가 발생한다', () => {
      const result = joinSchema.safeParse({ ...validJoin, address: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('주소를 검색해주세요.');
      }
    });
  });
});
