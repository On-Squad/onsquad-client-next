import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

import { CrewHome } from '@/widgets/crew-list';

import type { CrewHomeData } from '@/entities/crew';
import { crewQueries } from '@/entities/crew/api/crew.queries';

import { withAppbar } from '@/shared/lib/hoc/withAppbar';
import { getQueryClient } from '@/shared/lib/queries/get-query-client';

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

  const data = queryClient.getQueryData<CrewHomeData>(crewQueries.home({ crewId, category }).queryKey);

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CrewHome data={data} />
      </HydrationBoundary>
    </>
  );
}

export default withAppbar(CrewHomePage);
