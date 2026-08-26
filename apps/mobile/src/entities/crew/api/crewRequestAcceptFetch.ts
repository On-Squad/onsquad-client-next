import { apiFetch } from '../../../shared/api/common';
import type { ResponseModel } from '../../../shared/api/model';

export interface CrewRequestAcceptFetchParams {
  /** 크루 pk */
  crewId: number;
  /** 신청 pk */
  requestId: number;
}

export interface CrewRequestAcceptFetchResponseProps extends ResponseModel {
  data: '';
}

/**
 * 크루 참가 신청 수락
 * - PATCH /api/crews/{crewId}/requests/{requestId}
 *
 * **거절과 경로가 같고 메서드만 다르다.** 여기를 delete 로 바꾸면 수락 버튼이 거절한다.
 */
export const crewRequestAcceptFetch = ({ crewId, requestId }: CrewRequestAcceptFetchParams) =>
  apiFetch.patch<CrewRequestAcceptFetchResponseProps>(`/crews/${crewId}/requests/${requestId}`);
