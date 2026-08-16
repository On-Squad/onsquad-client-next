import { z } from 'zod';

const URL_REGEXP = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/;

export const createSquadSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  capacity: z
    .string()
    .min(1, '모집 인원을 입력해주세요')
    .refine((value) => Number(value) >= 1, '모집 인원은 1명 이상이어야 합니다'),
  address: z.string().min(1, '주소를 검색해주세요'),
  addressDetail: z.string().min(1, '상세 주소를 입력해주세요'),
  categories: z.array(z.string()).min(1, '카테고리를 선택해주세요').max(5, '최대 5개까지 선택할 수 있어요'),
  kakaoLink: z.string().min(1, '카카오 오픈채팅 링크를 입력해주세요').regex(URL_REGEXP, '유효한 URL을 입력해주세요'),
  // yup 의 excludeEmptyString 대응 — 빈 문자열이거나, URL 형식이거나.
  discordLink: z.union([z.literal(''), z.string().regex(URL_REGEXP, '유효한 URL을 입력해주세요')]).default(''),
});

export type CreateSquadFormValues = z.infer<typeof createSquadSchema>;
