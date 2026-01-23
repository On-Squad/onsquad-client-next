import React from 'react';

import { CommunityContainer } from '@/widgets/community-container';
import { Appbar } from '@/shared/ui/Appbar';
import {
  CREW_LIST_QUERY_KEY,
  crewListOptions,
} from '@/services/options/crewListOptions';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/services/get-query-client';
import type { CrewListDataType } from '@/entities/crew';

export default async function CommunityPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(crewListOptions);

  const crewListData = queryClient.getQueryData<CrewListDataType>([
    CREW_LIST_QUERY_KEY,
  ]);
  return (
    <>
      <Appbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CommunityContainer list={crewListData ?? []} />
      </HydrationBoundary>
    </>
  );
}
