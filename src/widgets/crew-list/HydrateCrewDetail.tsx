import React, { ReactNode, Suspense } from 'react';

import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import type { CrewDetailDataType } from '@/entities/crew';

import { getQueryClient } from '@/shared/lib/queries/get-query-client';
import { CREW_DETAIL_QUERY_KEY, crewDetailOptions } from '@/shared/lib/queries/options/crews/crewDetailOptions';
import { Appbar } from '@/shared/ui/Appbar';

interface HydrateCrewDetailProps {
  id: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  children: (data?: CrewDetailDataType) => ReactNode;
}

const HydrateCrewDetail = async ({ id, children }: HydrateCrewDetailProps) => {
  const crewId = parseInt(id, 10);

  const queryClient = getQueryClient();

  try {
    await queryClient.fetchQuery(crewDetailOptions({ crewId }));
  } catch (error) {
    console.error(error);

    throw error;
  }

  const crewDetailData = queryClient.getQueryData<CrewDetailDataType>([CREW_DETAIL_QUERY_KEY, crewId]);

  return (
    <>
      <Appbar isMenuHeader={false} title={crewDetailData?.name} />

      <HydrationBoundary state={dehydrate(queryClient)}>{children(crewDetailData)}</HydrationBoundary>
    </>
  );
};

export default HydrateCrewDetail;
