import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import type { CrewDetailData } from '@/entities/crew';
import { crewQueries } from '@/entities/crew/api/crew.queries';

import { getQueryClient } from '@/shared/lib/queries';
import { Appbar } from '@/shared/ui/Appbar';

async function CrewDetailLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const { id } = await params;

  const crewId = parseInt(id, 10);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(crewQueries.detail({ crewId }));

  const crewDetailData = queryClient.getQueryData<CrewDetailData>(crewQueries.detail({ crewId }).queryKey);

  const appBarTitle = crewDetailData?.crew?.name;
  return (
    <>
      <Appbar isMenuHeader={false} title={appBarTitle} />
      <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
    </>
  );
}

export default CrewDetailLayout;
