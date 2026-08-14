import { NoTabContentLayout } from '@/widgets/NoTabContentLayout';

import { SquadDetail, SquadDetailAppbar } from '@/features/squad/detail';

interface SquadDetailPageProps {
  params: Promise<{ id: string }>;
}

const SquadDetailPage = async ({ params }: SquadDetailPageProps) => {
  const { id } = await params;

  return (
    <NoTabContentLayout header={<SquadDetailAppbar squadId={Number(id)} />}>
      <SquadDetail id={id} />
    </NoTabContentLayout>
  );
};

export default SquadDetailPage;
