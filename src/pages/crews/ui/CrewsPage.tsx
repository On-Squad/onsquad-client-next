import React from 'react';

import { Appbar } from '@/shared/ui/Appbar';
import { MyCrew } from '@/widgets/crew-list';

export default function CrewsPage() {
  return (
    <>
      <Appbar />
      <MyCrew />
    </>
  );
}
