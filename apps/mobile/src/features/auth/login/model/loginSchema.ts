import { z } from 'zod';

import { LOGIN_REGEXP } from '../../../../shared/config/regexp';

export const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요.').regex(LOGIN_REGEXP.email, '이메일 형식에 맞지 않습니다.'),
  password: z
    .string()
    .min(1, '패스워드를 입력해주세요.')
    .regex(LOGIN_REGEXP.password, '패스워드는 영문, 숫자, 특수문자를 포함한 8자 이상입니다.'),
});
