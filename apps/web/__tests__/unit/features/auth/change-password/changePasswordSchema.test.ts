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
      // 사용자에게 실제로 보이는 것은 이 필드의 첫 메시지다(react-hook-form 이 그렇게 쓴다).
      // 배열 포함 여부로 느슨하게 두면 표시 문구가 바뀌어도 통과해버린다.
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('비밀번호가 일치하지 않습니다.');
      }
    });

    it('새 비밀번호와 확인을 둘 다 비우면 다시 입력하라고 안내한다', () => {
      const result = changePasswordSchema.safeParse({ ...validChange, newPassword: '', newPasswordConfirm: '' });

      expect(result.success).toBe(false);
      // 둘 다 비면 "일치하지 않는다"가 아니라 "한 번 더 입력하라"가 나와야 한다.
      // 이 분기를 안 잠그면 확인란 메시지 로직의 절반이 검증되지 않는다.
      if (!result.success) {
        const confirmIssue = result.error.issues.find((issue) => issue.path[0] === 'newPasswordConfirm');

        expect(confirmIssue?.message).toBe('새로운 비밀번호를 한 번 더 입력해주세요.');
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
