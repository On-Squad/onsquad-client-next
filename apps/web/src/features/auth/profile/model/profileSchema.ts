import { z } from 'zod';

import { MBTI, type Mbti } from '@/shared/config';

// 빈 문자열을 넣지 않는다. yup 은 oneOf 에 '' 를 허용했지만 required() 가 그걸 막았다 —
// 실측: yup 에서 '' 는 'MBTI를 선택해주세요.' 로 실패한다. 그 동작을 재현한다.
const MBTI_VALUES: readonly string[] = [...MBTI];

export const profileSchema = z.object({
  nickname: z.string().min(1, '닉네임을 입력해주세요.'),
  introduce: z.string().min(1, '멋진 소개를 입력해주세요.'),
  kakaoLink: z.string().min(1, '오픈 카톡 프로필 링크를 입력해주세요.'),
  // 업로드 위젯이 File 또는 미리보기 문자열을 넣는다. 폼 밖에서 좁히므로 여기서는 열어둔다.
  profileImage: z.unknown().optional(),
  // z.string({ error }) 를 써야 undefined 입력에서도 우리 메시지가 나온다(실측 확인).
  // 기본 z.string() 은 "Invalid input: expected string, received undefined" 를 낸다.
  mbti: z
    .string({ error: 'MBTI를 선택해주세요.' })
    // 타입 프레디킷으로 refine 해야 mbti 의 추론 타입이 string 이 아니라 Mbti 로 좁혀진다.
    // '' 는 MBTI_VALUES 에 없으므로 통과하지 못한다(위 주석 참조).
    .refine((value): value is Mbti => MBTI_VALUES.includes(value), 'MBTI를 선택해주세요.'),
  address: z.string().min(1, '주소를 입력해주세요.'),
  addressDetail: z.string().optional(),
  profileImageFile: z.unknown().optional(),
});
