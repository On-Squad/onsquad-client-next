import React from 'react';

import { AnnounceList } from '@/features/crew/announce';

import { Appbar } from '@/shared/ui/Appbar';

export default function AnnouncePage() {
  return (
    <>
      <Appbar isMenuHeader={false} title="강아지 귀여워" />
      <AnnounceList />
    </>
  );
}
