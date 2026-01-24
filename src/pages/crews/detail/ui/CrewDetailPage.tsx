import { HydrateCrewDetail } from '@/widgets/crew-list';

import { CrewDetail } from '@/features/crew/detail';

interface CrewDetailPageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function CrewDetailPage({ params, searchParams }: CrewDetailPageProps) {
  const { id } = await params;

  return (
    <>
      <HydrateCrewDetail id={id} searchParams={searchParams}>
        {(data) => <CrewDetail data={data} />}
      </HydrateCrewDetail>
    </>
  );
}
