import { z } from 'zod';

const URL_REGEXP = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/;

export const addCrewSchema = z.object({
  name: z.string().min(1, '사용하실 크루 이름을 입력해주세요.').max(15, '크루 이름은 최대 15자 입니다.'),
  introduce: z.string().min(1, '크루의 멋진 소개를 적어주세요.').max(150, '크루소개는 최대 150자로 입력해주세요.'),
  detail: z
    .string()
    .min(1, '신청자가 볼 크루에 대한 정보를 알려주세요.')
    .max(150, '크루 상세정보는 최대 150자로 입력해주세요.'),
  kakaoLink: z.string().min(1, '소통방 링크를 입력해주세요.').regex(URL_REGEXP, '유효한 URL을 입력해주세요.'),
  hashtags: z.array(z.string()).min(1, '최소 1개의 해시태그가 필요합니다.').max(5, '해시태그는 최대 5개입니다.'),
  // 기존 yup 은 lazy + 자기참조 when 이었으나 실질 검증이 없었다(항상 통과).
  // 그 동작을 그대로 유지하되 구조만 단순화한다. 실제 파일 검증이 필요하면 별도 작업으로 다룬다.
  file: z.unknown().optional(),
});
