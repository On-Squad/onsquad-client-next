import { apiFetch } from '../../../shared/api/common';
import type { ResponseModel } from '../../../shared/api/model';
import type { CrewRole } from '../../../shared/types';
import type { Mbti } from '../../../shared/api/model';

export interface CrewAnnounceListGetFetchParams {
  crewId: number;
}

export interface CrewAnnounceListResponseProps extends ResponseModel {
  data: {
    states: {
      /** 공지사항 작성 가능 여부 */
      canWrite: boolean;
      role: CrewRole;
    };
    announces: {
      id: number;
      title: string;
      content: string;
      createdAt: string;
      pinned: boolean;
      pinnedAt: string;
      writer: {
        id: number;
        nickname: string;
        introduce: string;
        mbti: Mbti;
        role: string;
      };
      states: {
        role: CrewRole;
      };
    }[];
  };
}

/**
 * 크루 별 공지사항 리스트 전체 조회 — 웹 crewAnnounceGetFetch 와 같은 엔드포인트.
 * GET /api/crews/{crewId}/announces
 */
export const crewAnnounceListGetFetch = ({ crewId }: CrewAnnounceListGetFetchParams) =>
  apiFetch.get<CrewAnnounceListResponseProps>(`/crews/${crewId}/announces`);
