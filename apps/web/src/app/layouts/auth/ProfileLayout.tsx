import React from 'react';

import { auth } from '@/auth';

import { NoTabContentLayout } from '@/widgets/NoTabContentLayout';

import { Appbar } from '@/shared/ui/Appbar';

const ProfileLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <NoTabContentLayout header={<Appbar title={`${session?.nickname}의 프로필`} />}>{children}</NoTabContentLayout>
  );
};

export default ProfileLayout;
