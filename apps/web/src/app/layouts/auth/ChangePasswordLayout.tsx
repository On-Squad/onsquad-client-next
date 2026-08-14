import React from 'react';

import { NoTabContentLayout } from '@/widgets/NoTabContentLayout';

import { Appbar } from '@/shared/ui/Appbar';

const ChangePasswordLayout = ({ children }: { children: React.ReactNode }) => {
  return <NoTabContentLayout header={<Appbar title="비밀번호 변경" />}>{children}</NoTabContentLayout>;
};

export default ChangePasswordLayout;
