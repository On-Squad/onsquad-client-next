import React from 'react';

import { WriteForm } from '@/features/crew/announce';

import { Appbar } from '@/shared/ui/Appbar';

export default function AnnounceWritePage() {
  return (
    <>
      <Appbar isMenuHeader={false} title="공지사항" />
      <WriteForm />
    </>
  );
}
