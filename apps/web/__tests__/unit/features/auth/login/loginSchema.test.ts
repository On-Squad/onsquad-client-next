import { describe, expect, it } from 'vitest';

import { loginSchema } from '@/features/auth/login/ui/validator';

const validLogin = {
  email: 'test@example.com',
  password: 'Password1!',
};

describe('loginSchema', () => {
  it('유효한 입력은 검증을 통과한다', () => {
    const result = loginSchema.safeParse(validLogin);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validLogin);
    }
  });

  describe('email 필드', () => {
    it('이메일이 비어있으면 required 에러가 발생한다', () => {
      const result = loginSchema.safeParse({ ...validLogin, email: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('이메일을 입력해주세요.');
      }
    });

    it('이메일 형식이 올바르지 않으면 에러가 발생한다', () => {
      const result = loginSchema.safeParse({ ...validLogin, email: 'invalid-email' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('이메일 형식에 맞지 않습니다.');
      }
    });

    it('@가 없는 이메일이면 에러가 발생한다', () => {
      const result = loginSchema.safeParse({ ...validLogin, email: 'testexample.com' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('이메일 형식에 맞지 않습니다.');
      }
    });
  });

  describe('password 필드', () => {
    it('패스워드가 비어있으면 required 에러가 발생한다', () => {
      const result = loginSchema.safeParse({ ...validLogin, password: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('패스워드를 입력해주세요.');
      }
    });

    it('특수문자가 없는 패스워드는 에러가 발생한다', () => {
      const result = loginSchema.safeParse({ ...validLogin, password: 'Password1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('패스워드는 영문, 숫자, 특수문자를 포함한 8자 이상입니다.');
      }
    });

    it('8자 미만 패스워드는 에러가 발생한다', () => {
      const result = loginSchema.safeParse({ ...validLogin, password: 'Pw1!' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('패스워드는 영문, 숫자, 특수문자를 포함한 8자 이상입니다.');
      }
    });

    it('숫자가 없는 패스워드는 에러가 발생한다', () => {
      const result = loginSchema.safeParse({ ...validLogin, password: 'Password!' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('패스워드는 영문, 숫자, 특수문자를 포함한 8자 이상입니다.');
      }
    });
  });
});
