import React, { Suspense, ReactNode } from 'react';
import { Appbar } from '@/shared/ui/Appbar';
import {
  crewDetailOptions,
  CREW_DETAIL_QUERY_KEY,
} from '@/services/options/crews/crewDetailOptions';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/services/get-query-client';
import type { CrewDetailDataType } from '@/entities/crew';

interface HydrateCrewDetailProps {
  id: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  children: (data?: CrewDetailDataType) => ReactNode;
}

const HydrateCrewDetail = async ({
  id,
  children,
}: HydrateCrewDetailProps) => {
  const crewId = parseInt(id, 10);

  const queryClient = getQueryClient();

  try {
    await queryClient.fetchQuery(crewDetailOptions({ crewId }));
  } catch (error) {
    console.error(error);

    throw error;
  }

  const crewDetailData = queryClient.getQueryData<CrewDetailDataType>([
    CREW_DETAIL_QUERY_KEY,
    crewId,
  ]);

  return (
    <>
      <Appbar isMenuHeader={false} title={crewDetailData?.name} />

      <HydrationBoundary state={dehydrate(queryClient)}>
        {children(crewDetailData)}
      </HydrationBoundary>
    </>
  );
};

export default HydrateCrewDetail;
