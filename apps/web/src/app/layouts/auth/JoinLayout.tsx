import React from 'react';

import { NoTabContentLayout } from '@/widgets/NoTabContentLayout';

import { Appbar } from '@/shared/ui/Appbar';

const JoinLayout = ({ children }: { children: React.ReactNode }) => {
  return <NoTabContentLayout header={<Appbar title="회원가입" />}>{children}</NoTabContentLayout>;
};

export default JoinLayout;
