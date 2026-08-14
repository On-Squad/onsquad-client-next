import React from 'react';

import { NoTabContentLayout } from '@/widgets/NoTabContentLayout';

import { Appbar } from '@/shared/ui/Appbar';

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
  return <NoTabContentLayout header={<Appbar title="로그인" />}>{children}</NoTabContentLayout>;
};

export default LoginLayout;
