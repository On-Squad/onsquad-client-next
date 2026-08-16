import { z } from 'zod';

export const searchSchema = z.object({
  search: z.string().trim().min(1, '검색어를 입력해주세요.').min(2, '검색어는 최소 2자 이상 입력해주세요.'),
});
