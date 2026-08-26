import { crewQueries } from '../../../../entities/crew/api/crew.queries';
import { crewRequestPostFetch } from '../../../../entities/crew/api/crewRequestPostFetch';
import { useApiMutation } from '../../../../shared/lib/queries/useApiMutation';

/**
 * 크루 참가 신청.
 *
 * 웹은 `crewQueries.manage` 와 `memberQueries.myCrewRequests` 도 무효화한다.
 * RN 엔 아직 그 쿼리들이 없다 — 생기면 여기도 함께 추가한다.
 */
export const useCrewRequestMutation = ({ crewId }: { crewId: number }) =>
  useApiMutation({
    fetcher: (id: number) => crewRequestPostFetch({ crewId: id }),
    invalidateKeys: [crewQueries.detail({ crewId }).queryKey],
  });
