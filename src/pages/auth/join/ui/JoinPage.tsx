import React from 'react';

import { JoinForm } from '@/features/auth/join';

import { Appbar } from '@/shared/ui/Appbar';

export default function JoinPage() {
  return (
    <>
      <Appbar isMenuHeader={false} title="회원가입" />
      <div className="container pt-20">
        <JoinForm />
      </div>
    </>
  );
}
