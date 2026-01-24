import React from 'react';

import { AddForm } from '@/features/crew/create';

import { Appbar } from '@/shared/ui/Appbar';

export default function AddCrewPage() {
  return (
    <>
      <Appbar isMenuHeader={false} title="크루 개설하기" />
      <AddForm />
    </>
  );
}
