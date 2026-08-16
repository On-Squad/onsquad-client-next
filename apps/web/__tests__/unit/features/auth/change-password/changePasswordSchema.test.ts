import { describe, expect, it } from 'vitest';

import { changePasswordSchema } from '@/features/auth/change-password/model/changePasswordSchema';

const validChange = {
  currentPassword: 'Current1!',
  newPassword: 'NewPass1!',
  newPasswordConfirm: 'NewPass1!',
};

describe('changePasswordSchema', () => {
  it('유효한 입력은 검증을 통과한다', () => {
    expect(changePasswordSchema.safeParse(validChange).success).toBe(true);
  });

  describe('currentPassword 필드', () => {
    it('현재 비밀번호가 비어있으면 required 에러가 발생한다', () => {
      const result = changePasswordSchema.safeParse({ ...validChange, currentPassword: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('현재 비밀번호를 입력해주세요.');
      }
    });

    it('현재 비밀번호가 패턴에 맞지 않으면 에러가 발생한다', () => {
      const result = changePasswordSchema.safeParse({ ...validChange, currentPassword: 'password1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('영문, 숫자, 특수문자 1자를 포함한 8자리 이상입니다.');
      }
    });
  });

  describe('newPassword 필드', () => {
    it('새 비밀번호가 비어있으면 required 에러가 발생한다', () => {
      const result = changePasswordSchema.safeParse({ ...validChange, newPassword: '' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('새로운 비밀번호를 입력해주세요.');
      }
    });

    it('새 비밀번호가 패턴에 맞지 않으면 에러가 발생한다', () => {
      const result = changePasswordSchema.safeParse({ ...validChange, newPassword: 'password1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('영문, 숫자, 특수문자 1자를 포함한 8자리 이상입니다.');
      }
    });
  });

  describe('newPasswordConfirm 필드', () => {
    it('새 비밀번호 확인이 비어있으면 불일치 에러가 발생한다', () => {
      const result = changePasswordSchema.safeParse({ ...validChange, newPasswordConfirm: '' });

      expect(result.success).toBe(false);
      // newPasswordConfirm 이 비면 필드 레벨 required 체크가 먼저 issues[0] 을 채운다.
      // 교차 필드 refine 은 그 뒤에 실행되어 issues 배열 어딘가에 붙으므로 배열 전체에서 찾는다.
      if (!result.success) {
        expect(result.error.issues.map((issue) => issue.message)).toContain('비밀번호가 일치하지 않습니다.');
      }
    });

    it('newPassword와 newPasswordConfirm이 다르면 에러가 발생한다', () => {
      const result = changePasswordSchema.safeParse({ ...validChange, newPasswordConfirm: 'Different1!' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('비밀번호가 일치하지 않습니다.');
        expect(result.error.issues[0].path[0]).toBe('newPasswordConfirm');
      }
    });
  });
});
