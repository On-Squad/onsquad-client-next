import React from 'react';

import { NoTabContentLayout } from '@/widgets/NoTabContentLayout';

import { Appbar } from '@/shared/ui/Appbar';

const AddCrewLayout = ({ children }: { children: React.ReactNode }) => {
  return <NoTabContentLayout header={<Appbar title="크루 개설하기" />}>{children}</NoTabContentLayout>;
};

export default AddCrewLayout;
