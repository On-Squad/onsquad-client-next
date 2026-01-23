import { queryOptions } from '@tanstack/react-query';
import {
  crewListGetFetch,
  crewHomeInfoGetFetch,
  crewDetailGetFetch,
  type CrewHomeInfoGetFetchParams,
  type CrewDetailGetFetchParams,
  type CrewListGetFetchParams,
} from '@/shared/api/crew';

export const crewQueries = {
  root: () => ['crew'],
  lists: () => [...crewQueries.root(), 'list'],
  list: ({ size, page, crewName }: CrewListGetFetchParams) =>
    queryOptions({
      queryKey: [...crewQueries.lists(), size, page, crewName],
      queryFn: async () => {
        const res = await crewListGetFetch({ size, page, crewName });

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
};
