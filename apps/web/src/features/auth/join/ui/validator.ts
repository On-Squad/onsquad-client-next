import { z } from 'zod';

import { LOGIN_REGEXP } from '@/shared/config/regexp';

export const joinSchema = z
  .object({
    email: z.string().min(1, '이메일을 입력해주세요,').regex(LOGIN_REGEXP.email, '이메일 형식에 맞지 않습니다.'),

    authCode: z.string().min(1, '이메일 인증을 진행해주세요.').min(8, '인증번호는 최소 8자리입니다.'),

    password: z
      .string()
      .min(1, '비밀번호를 입력해주세요.')
      .regex(LOGIN_REGEXP.password, '영문, 숫자, 특수문자 1자를 포함한 8자리 이상입니다.'),

    passwordConfirm: z.string().min(1, '비밀번호를 한 번 더 입력해주세요.'),

    nickname: z.string().min(1, '닉네임을 입력해주세요.'),

    address: z.string().min(1, '주소를 검색해주세요.'),

    addressDetail: z.string().optional(),
  })
  // zod 는 필드 레벨에서 다른 필드를 못 본다. 객체 레벨로 올리고 path 로 필드를 지정한다.
  .refine((values) => values.password === values.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type JoinSchemaType = z.infer<typeof joinSchema>;
