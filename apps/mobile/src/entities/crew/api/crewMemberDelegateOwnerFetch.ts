import { apiFetch } from '../../../shared/api/common';
import type { ResponseModel } from '../../../shared/api/model';

export interface CrewMemberDelegateOwnerFetchParams {
  crewId: number;
  targetMemberId: number;
}

export interface CrewMemberDelegateOwnerFetchResponseProps extends ResponseModel {
  data: '';
}

/**
 * 크루장 위임
 * - PATCH /api/crews/{crewId}/members/{targetMemberId}/owner
 */
export const crewMemberDelegateOwnerFetch = ({ crewId, targetMemberId }: CrewMemberDelegateOwnerFetchParams) =>
  apiFetch.patch<CrewMemberDelegateOwnerFetchResponseProps>(`/crews/${crewId}/members/${targetMemberId}/owner`);
