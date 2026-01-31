import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import {
  type CrewAnnounceGetFetchParams,
  type CrewDetailGetFetchParams,
  type CrewHomeInfoGetFetchParams,
  type CrewListGetFetchParams,
  crewAnnounceGetFetch,
  crewDetailGetFetch,
  crewHomeInfoGetFetch,
  crewListGetFetch,
  myCrewListGetFetch,
} from '@/shared/api/crew';

export const crewQueries = {
  root: () => ['crew'],
  lists: () => [...crewQueries.root(), 'list'],
  list: ({ size = 10, page = 1, crewName = '' }: CrewListGetFetchParams = {}) =>
    queryOptions({
      queryKey: [...crewQueries.lists(), size, page, crewName],
      queryFn: async () => {
        const res = await crewListGetFetch({ size, page, crewName });

        return res.data.data;
      },
    }),

  infiniteList: ({ crewName = '' }: Pick<CrewListGetFetchParams, 'crewName'> = {}) =>
    infiniteQueryOptions({
      queryKey: [...crewQueries.lists(), 'infinite', { size: 10, crewName }],
      queryFn: async ({ pageParam }) => {
        const res = await crewListGetFetch({
          size: 10,
          page: pageParam,
          crewName,
        });
        return {
          data: res.data.data,
          nextPage: res.data.data.length === 10 ? pageParam + 1 : undefined,
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: crewName ? 1 : 2,
    }),

  myCrewList: () =>
    queryOptions({
      queryKey: [...crewQueries.lists(), 'my'],
      queryFn: async () => {
        const res = await myCrewListGetFetch();

        if (res.data.error) {
          throw new Error(res.data.error.message);
        }

        return res.data.data;
      },
    }),

  detail: ({ crewId }: CrewDetailGetFetchParams) =>
    queryOptions({
      queryKey: [...crewQueries.root(), 'detail', crewId],
      queryFn: async () => {
        const res = await crewDetailGetFetch({ crewId });

        return res.data.data;
      },
      throwOnError: true,
    }),

  home: ({ crewId, category }: CrewHomeInfoGetFetchParams) =>
    queryOptions({
      queryKey: [...crewQueries.root(), 'home', crewId, category],
      queryFn: async () => {
        const res = await crewHomeInfoGetFetch({ crewId, category });

        return res.data;
      },
    }),

  announceList: ({ crewId }: CrewAnnounceGetFetchParams) =>
    queryOptions({
      queryKey: [...crewQueries.lists(), 'announce', crewId],
      queryFn: async () => {
        const res = await crewAnnounceGetFetch({ crewId });

        return res.data;
      },
    }),
};
