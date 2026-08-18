import { queryOptions } from '@tanstack/react-query';

import { makeQueryOptions } from '../../../shared/lib/queries/makeQueryOptions';
import { type CrewDetailGetFetchParams, crewDetailGetFetch } from './crewDetailGetFetch';
import { type CrewHomeInfoGetFetchParams, crewHomeInfoGetFetch } from './crewHomeInfoGetFetch';
import { type CrewListGetFetchParams, crewListGetFetch } from './crewListGetFetch';

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

  detail: ({ crewId }: CrewDetailGetFetchParams) =>
    makeQueryOptions([...crewQueries.root(), 'detail', crewId], () => crewDetailGetFetch({ crewId })),

  home: ({ crewId, page, size }: CrewHomeInfoGetFetchParams) =>
    makeQueryOptions([...crewQueries.root(), 'home', crewId, page, size], () =>
      crewHomeInfoGetFetch({ crewId, page, size }),
    ),
};
