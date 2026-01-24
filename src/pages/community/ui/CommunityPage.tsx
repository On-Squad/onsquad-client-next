import React from 'react';

import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { CommunityContainer } from '@/widgets/community-container';

import { crewQueries } from '@/entities/crew/api/crew.queries';

import { getQueryClient } from '@/shared/lib/queries/get-query-client';
import { Appbar } from '@/shared/ui/Appbar';

export default async function CommunityPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(crewQueries.list());

  return (
    <>
      <Appbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CommunityContainer />
      </HydrationBoundary>
    </>
  );
}
