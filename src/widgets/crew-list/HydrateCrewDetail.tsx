import { type ReactNode } from 'react';

import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import type { CrewDetailData } from '@/entities/crew';
import { crewQueries } from '@/entities/crew/api/crew.queries';

import { getQueryClient } from '@/shared/lib/queries/get-query-client';
import { Appbar } from '@/shared/ui/Appbar';

interface HydrateCrewDetailProps {
  id: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  children: (data?: CrewDetailData) => ReactNode;
}

const HydrateCrewDetail = async ({ id, children }: HydrateCrewDetailProps) => {
  const crewId = parseInt(id, 10);

  const queryClient = getQueryClient();

  try {
    await queryClient.fetchQuery(crewQueries.detail({ crewId }));
  } catch (error) {
    console.error(error);

    throw error;
  }

  const crewDetailData = queryClient.getQueryData<CrewDetailData>(crewQueries.detail({ crewId }).queryKey);

  return (
    <>
      <Appbar isMenuHeader={false} title={crewDetailData?.crew?.name} />

      <HydrationBoundary state={dehydrate(queryClient)}>{children(crewDetailData)}</HydrationBoundary>
    </>
  );
};

export default HydrateCrewDetail;
