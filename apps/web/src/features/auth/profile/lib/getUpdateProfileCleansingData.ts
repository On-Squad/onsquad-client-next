import { z } from 'zod';

import { type UserProfilePutFetchParams } from '@/entities/auth/api/userProfilePutFetch';

import { profileSchema } from '../model/profileSchema';

type UpdateProfileCleansingData = z.infer<typeof profileSchema>;

// 반환 타입을 명시하지 않으면 mbti 의 리터럴 유니온(Mbti | '')이 순수 리터럴 값들로만 구성된 유니온이라
// object literal 추론 과정에서 string 으로 넓혀진다. UserProfilePutFetchParams 로 고정해 막는다.
export const getUpdateProfileCleansingData = (data: Partial<UpdateProfileCleansingData>): UserProfilePutFetchParams => {
  return {
    nickname: data.nickname ?? '',
    introduce: data.introduce ?? '',
    mbti: data.mbti ?? '',
    kakaoLink: data.kakaoLink ?? '',
    address: data.address ?? '',
    addressDetail: data.addressDetail ?? '',
  };
};
