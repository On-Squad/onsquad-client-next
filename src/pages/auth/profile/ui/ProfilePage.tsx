import React from 'react';
import { ProfileForm } from '@/features/auth/profile';
import { Appbar } from '@/shared/ui/Appbar';
import { auth } from '@/auth';

export default async function ProfilePage() {
  const session = await auth();

  return (
    <>
      <Appbar isMenuHeader={false} title={`${session?.nickname}의 프로필`} />
      <ProfileForm />
    </>
  );
}
