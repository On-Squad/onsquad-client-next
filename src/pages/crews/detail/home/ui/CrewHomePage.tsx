import React from 'react';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import { Appbar } from '@/shared/ui/Appbar';
import { CrewHome } from '@/widgets/crew-list';
import {
  crewHomeInfoOptions,
  CREW_HOME_INFO_QUERY_KEY,
} from '@/services/options/crews/crewHomeInfoOptions';

import { getQueryClient } from '@/services/get-query-client';
import type { CrewHomeDataType } from '@/entities/crew';

const getHomeData = async (
  queryClient: QueryClient,
  crewId: number,
  category: string,
) => {
  try {
    await queryClient.fetchQuery(
      crewHomeInfoOptions({
        crewId,
        category,
      }),
    );
  } catch (error) {
    console.error('크루 홈 데이터 가져오기 실패:', error);
    throw error;
  }
};

export default async function CrewHomePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { category: string };
}) {
  const { id } = await params;
  const { category = '' } = await searchParams;

  const crewId = parseInt(id, 10);

  const queryClient = getQueryClient();

  await getHomeData(queryClient, crewId, category);

  const data = queryClient.getQueryData<CrewHomeDataType>([
    CREW_HOME_INFO_QUERY_KEY,
    crewId,
    category,
  ]);

  return (
    <>
      <Appbar isMenuHeader={false} title={data?.crew?.name || '크루'} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CrewHome data={data} />
      </HydrationBoundary>
    </>
  );
}
