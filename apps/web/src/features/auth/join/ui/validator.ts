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

    // 필드 레벨에 min(1) 을 두지 않는다 — 아래 superRefine 이 두 메시지를 모두 관장한다.
    passwordConfirm: z.string(),

    nickname: z.string().min(1, '닉네임을 입력해주세요.'),

    address: z.string().min(1, '주소를 검색해주세요.'),

    addressDetail: z.string().optional(),
  })
  /**
   * zod 는 필드 레벨에서 다른 필드를 못 본다. 객체 레벨로 올리고 path 로 필드를 지정한다.
   *
   * 확인란의 메시지는 두 가지이고, **어느 것이 뜨는지가 yup 과 같아야 한다.**
   * yup 의 `required(A).oneOf([ref], B)` 는 실측상 이렇게 동작했다.
   *   확인란만 빈값 (비밀번호는 정상) → B (일치하지 않습니다)
   *   둘 다 빈값                     → A (한 번 더 입력해주세요)
   *
   * 필드에 `min(1, A)` 를 두면 첫 줄이 A 로 바뀐다 — react-hook-form 은 필드당 첫 issue 를
   * 쓰기 때문이다. 그래서 한 곳에서 갈라 하나만 낸다.
   */
  .superRefine((values, ctx) => {
    if (values.passwordConfirm === '' && values.password === '') {
      ctx.addIssue({ code: 'custom', message: '비밀번호를 한 번 더 입력해주세요.', path: ['passwordConfirm'] });

      return;
    }

    if (values.password !== values.passwordConfirm) {
      ctx.addIssue({ code: 'custom', message: '비밀번호가 일치하지 않습니다.', path: ['passwordConfirm'] });
    }
  });

export type JoinSchemaType = z.infer<typeof joinSchema>;
