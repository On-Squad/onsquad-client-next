import React from 'react';

import { Appbar } from '@/shared/ui/Appbar';
import { AnnounceList } from '@/features/crew/announce';

export default function AnnouncePage() {
  return (
    <>
      <Appbar isMenuHeader={false} title="강아지 귀여워" />
      <AnnounceList />
    </>
  );
}
