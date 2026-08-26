import { crewQueries } from '../../../../entities/crew/api/crew.queries';
import { crewMemberLeaveFetch } from '../../../../entities/crew/api/crewMemberLeaveFetch';
import { useApiMutation } from '../../../../shared/lib/queries/useApiMutation';

/**
 * 크루 나가기.
 *
 * 웹은 `memberQueries.myCrewParticipants` 도 무효화한다.
 * RN 엔 아직 그 쿼리가 없다 — 생기면 여기도 함께 추가한다.
 */
export const useLeaveCrewMutation = ({ crewId }: { crewId: number }) =>
  useApiMutation({
    fetcher: () => crewMemberLeaveFetch({ crewId }),
    invalidateKeys: [crewQueries.detail({ crewId }).queryKey],
  });
