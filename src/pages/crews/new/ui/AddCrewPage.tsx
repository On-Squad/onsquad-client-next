import { AddForm } from '@/features/crew/new';

import { withAppbar } from '@/shared/lib/hoc/withAppbar';

function AddCrewPage() {
  return <AddForm />;
}

export default withAppbar(AddCrewPage);
