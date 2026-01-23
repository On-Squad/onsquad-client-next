import React from 'react';

import { Appbar } from '@/shared/ui/Appbar';
import { AddForm } from '@/features/crew/create';

export default function AddCrewPage() {
  return (
    <>
      <Appbar isMenuHeader={false} title="크루 개설하기" />
      <AddForm />
    </>
  );
}
