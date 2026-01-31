import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

import { CrewHome } from '@/features/crew/home';

import { crewQueries } from '@/entities/crew/api/crew.queries';

import type { CrewHomeInfoResponseProps } from '@/shared/api/crew';
import { getQueryClient } from '@/shared/lib/queries';
import { Appbar } from '@/shared/ui/Appbar';

const getHomeData = async (queryClient: QueryClient, crewId: number, category: string) => {
  try {
    await queryClient.fetchQuery(
      crewQueries.home({
        crewId,
        category,
      }),
    );
  } catch (error) {
    console.error('크루 홈 데이터 가져오기 실패:', error);
    throw error;
  }
};

async function CrewHomePage({ params, searchParams }: { params: { id: string }; searchParams: { category: string } }) {
  const { id } = await params;

  const { category = '' } = await searchParams;

  const crewId = parseInt(id, 10);

  const queryClient = getQueryClient();

  await getHomeData(queryClient, crewId, category);

  const crewData = queryClient.getQueryData<CrewHomeInfoResponseProps>(crewQueries.home({ crewId, category }).queryKey);

  const appBarTitle = crewData?.data?.crew?.name;
  const crewHomeData = crewData?.data;

  return (
    <>
      <Appbar isMenuHeader={false} title={appBarTitle} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CrewHome data={crewHomeData} />
      </HydrationBoundary>
    </>
  );
}

export default CrewHomePage;
