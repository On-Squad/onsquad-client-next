import { cancelRequestDeleteFetch } from '../../../../entities/crew/api/cancelRequestDeleteFetch';
import { crewQueries } from '../../../../entities/crew/api/crew.queries';
import { useApiMutation } from '../../../../shared/lib/queries/useApiMutation';

/**
 * 크루 참가 신청 취소.
 *
 * 웹은 `crewQueries.manage` 와 `memberQueries.myCrewRequests` 도 무효화한다.
 * RN 엔 아직 그 쿼리들이 없다 — 생기면 여기도 함께 추가한다.
 */
export const useCancelRequestMutation = ({ crewId }: { crewId: number }) =>
  useApiMutation({
    fetcher: (id: number) => cancelRequestDeleteFetch({ crewId: id }),
    invalidateKeys: [crewQueries.detail({ crewId }).queryKey],
  });
