import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { makeQueryOptions } from '../../../shared/lib/queries/makeQueryOptions';
import { type CrewAnnounceListGetFetchParams, crewAnnounceListGetFetch } from './crewAnnounceListGetFetch';
import { type CrewDetailGetFetchParams, crewDetailGetFetch } from './crewDetailGetFetch';
import { type CrewHomeInfoGetFetchParams, crewHomeInfoGetFetch } from './crewHomeInfoGetFetch';
import { type CrewListGetFetchParams, crewListGetFetch } from './crewListGetFetch';
import { type CrewManageGetFetchParams, crewManageGetFetch } from './crewManageGetFetch';
import { type CrewParticipantsGetFetchParams, crewParticipantsGetFetch } from './crewParticipantsGetFetch';

/**
 * 크루 쿼리 팩토리.
 *
 * **웹에 있는 것을 다 옮기지 않는다.** RN 이 실제로 쓰는 셋만 둔다 —
 * 공지·관리·멤버 쿼리는 해당 화면이 이관될 때 함께 온다.
 * 웹 배럴(`entities/crew/api/index.ts`)을 통째로 가져오면 화면도 없는 fetch 14개가 딸려온다.
 * 그게 이관 전 상태였고, `addCrewPostFetch` 의 타입 에러가 기준선에 남아 있던 이유다.
 *
 * 키는 항상 상위 키를 스프레드해서 만든다 — 부분 invalidate 가 가능해진다.
 */
export const crewQueries = {
  root: () => ['crew'],
  lists: () => [...crewQueries.root(), 'list'],

  // 웹과 같은 형태를 유지한다. 에러 봉투가 오면 undefined 를 반환해 React Query 가 터지는데,
  // 그건 웹도 같은 상태라 여기서 고치면 두 앱의 동작이 갈린다. 별도 항목으로 남긴다.
  list: ({ size = 10, page = 1, crewName = '' }: CrewListGetFetchParams = {}) =>
    queryOptions({
      queryKey: [...crewQueries.lists(), size, page, crewName],
      queryFn: async () => {
        const res = await crewListGetFetch({ size, page, crewName });

        return res.data.data;
      },
    }),

  /**
   * 무한스크롤 목록.
   *
   * **`initialPageParam` 이 웹과 다른 유일한 지점이다(웹: `crewName ? 1 : 2`).**
   * 웹 `CommunityContainer` 는 `crewQueries.list()` 로 1페이지를 따로 받아
   * `initialData` 로 무한쿼리에 **미리 꽂아넣고**(pageParams: [1]) 2페이지부터 이어간다.
   * RN 에는 그 seeding 이 없어서 2 로 시작하면 **1페이지가 통째로 빠지고**,
   * 크루가 20개일 때 10개만 보인 채 다음 페이지가 없어 무한스크롤이 멎는다(실측).
   */
  infiniteList: ({ crewName = '' }: Pick<CrewListGetFetchParams, 'crewName'> = {}) =>
    infiniteQueryOptions({
      queryKey: [...crewQueries.lists(), 'infinite', { size: 10, crewName }],
      queryFn: async ({ pageParam }) => {
        const res = await crewListGetFetch({ size: 10, page: pageParam, crewName });

        return {
          data: res.data.data,
          nextPage: res.data.data.resultsSize === 10 ? pageParam + 1 : undefined,
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
    }),

  detail: ({ crewId }: CrewDetailGetFetchParams) =>
    makeQueryOptions([...crewQueries.root(), 'detail', crewId], () => crewDetailGetFetch({ crewId })),

  manage: ({ crewId }: CrewManageGetFetchParams) =>
    makeQueryOptions([...crewQueries.lists(), 'manage', crewId], () => crewManageGetFetch({ crewId })),

  participants: ({ crewId, size = 5, page = 0 }: CrewParticipantsGetFetchParams) =>
    makeQueryOptions([...crewQueries.lists(), 'participants', crewId, size, page], () =>
      crewParticipantsGetFetch({ crewId, size, page }),
    ),

  home: ({ crewId, page, size }: CrewHomeInfoGetFetchParams) =>
    makeQueryOptions([...crewQueries.root(), 'home', crewId, page, size], () =>
      crewHomeInfoGetFetch({ crewId, page, size }),
    ),

  announceList: ({ crewId }: CrewAnnounceListGetFetchParams) =>
    makeQueryOptions([...crewQueries.root(), 'announce', crewId], () => crewAnnounceListGetFetch({ crewId })),
};
