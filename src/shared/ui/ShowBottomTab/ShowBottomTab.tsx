'use client';

import { usePathname } from 'next/navigation';

import { ReactNode } from 'react';

import { BOTTOMTAB_PATH } from '@/shared/config/paths';
import { BottomTab } from '@/shared/ui/BottomTab';

const ShowBottomTab = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const pathname = usePathname();

  const isShow = [BOTTOMTAB_PATH.community, BOTTOMTAB_PATH.crews, BOTTOMTAB_PATH.root].includes(
    pathname as ValueOf<typeof BOTTOMTAB_PATH>,
  );

  // min-h-[calc(100dvh-5rem)]

  return (
    <>
      <div className="bg-gray-50">{children}</div>
      {isShow && (
        <>
          <BottomTab />
          {/* <div className="bg-white h-8 fixed bottom-0 z-10 w-full" /> */}
          <div className="mx-auto h-20 min-w-[20rem] max-w-[45rem] bg-gray-50" />
        </>
      )}
    </>
  );
};

export default ShowBottomTab;
