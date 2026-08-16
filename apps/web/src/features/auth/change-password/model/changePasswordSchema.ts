import { z } from 'zod';

import { LOGIN_REGEXP } from '@/shared/config/regexp';

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, '현재 비밀번호를 입력해주세요.')
      .regex(LOGIN_REGEXP.password, '영문, 숫자, 특수문자 1자를 포함한 8자리 이상입니다.'),
    newPassword: z
      .string()
      .min(1, '새로운 비밀번호를 입력해주세요.')
      .regex(LOGIN_REGEXP.password, '영문, 숫자, 특수문자 1자를 포함한 8자리 이상입니다.'),
    newPasswordConfirm: z.string().min(1, '새로운 비밀번호를 한 번 더 입력해주세요.'),
  })
  .refine((values) => values.newPassword === values.newPasswordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['newPasswordConfirm'],
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
