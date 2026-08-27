import type { QueryClient } from '@tanstack/react-query';

import { crewQueries } from '../../entities/crew/api/crew.queries';

/**
 * 공지 목록을 다시 받게 한다.
 *
 * **RN 목록과 웹뷰는 쿼리 캐시를 공유하지 않는다.** 상단고정·글쓰기는 웹뷰 안에서 일어나고
 * 그쪽의 `invalidateQueries` 는 이 화면에 닿지 않는다. 그래서 목록이 다시 보일 때
 * 이 함수를 불러 서버 상태를 새로 받는다.
 *
 * **그 크루의 목록만 무효화한다.** 상위 키(`['crew']`)로 넓게 잡으면 크루 홈·상세까지
 * 딸려 재조회된다 — 웹뷰가 바꾼 것은 이 크루의 공지뿐이다.
 */
export const refreshAnnounces = ({ queryClient, crewId }: { queryClient: QueryClient; crewId: number }) =>
  queryClient.invalidateQueries({ queryKey: crewQueries.announceList({ crewId }).queryKey });
