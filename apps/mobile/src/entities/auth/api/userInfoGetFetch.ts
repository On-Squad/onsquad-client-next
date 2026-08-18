import { apiFetch } from '../../../shared/api/common';
import type { Mbti, ResponseModel } from '../../../shared/api/model';

export interface UserInfoResponse extends ResponseModel {
  data: {
    /**
     * 유저 식별값
     */
    id: number;

    /**
     * 유저 닉네임
     */
    nickname: string;

    /**
     * 유저 이메일
     */
    email: string;

    /**
     * 소개
     */
    introduce: string;

    /**
     * MBTI
     */
    mbti: Mbti | '';

    /**
     * 카카오 링크
     */
    kakaoLink: string;

    /**
     * 프로필 이미지
     */
    profileImage: string;

    /**
     * 로그인 유형
     */
    userType: '일반' | '카카오' | '구글';

    /**
     * 주소
     */
    address: string;

    /**
     * 상세주소
     */
    addressDetail: string;
  };
}

/**
 * 내 정보 조회.
 *
 * 웹은 `accessToken` 을 명시로 받는 분기가 있다(서버 컴포넌트가 세션 토큰을 넘긴다).
 * RN 은 셸이 provider 에 토큰을 꽂아두므로 그 분기가 필요 없다.
 *
 * 웹 응답의 `gender` · `birth` 는 원본에 `FIXME(api): 문서에 없음` 이 달려 있고
 * RN 이 쓰지 않아 옮기지 않는다 — 옮기면 그 FIXME 도 같이 복제된다.
 */
export const userInfoGetFetch = () => apiFetch.get<UserInfoResponse>('/members/me');
