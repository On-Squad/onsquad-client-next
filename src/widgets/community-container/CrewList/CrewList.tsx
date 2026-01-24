'use client';

import React from 'react';

import type { CrewListResponseProps } from '@/shared/api/crew/crewListGetFetch';
import { usePageMove } from '@/shared/lib/hooks';
import { Badge } from '@/shared/ui/Badge';
import { CrewCard } from '@/shared/ui/Card/CrewCard';

interface CrewListDataProps {
  list: PropType<CrewListResponseProps, 'data'>;
}

const CrewList = ({ list: crewList }: CrewListDataProps) => {
  const { handlePageMove } = usePageMove();

  return (
    <div className="grid grid-cols-2 gap-3 pt-6 S2:grid-cols-1 SE:grid-cols-1 mobile:grid-cols-1 tablet:grid-cols-1">
      {crewList?.map((crew) => (
        <CrewCard
          key={crew.id}
          crewImage={crew.imageUrl || '/images/mock1.png'}
          ownerName={crew.owner.nickname}
          title={crew.name}
          description={crew.introduce}
          tagSlot={
            <>
              <Badge>멤버 수 {crew.memberCount} 명</Badge>
              {crew.hashtags.map((tag, i) => (
                <Badge key={i}>{tag}</Badge>
              ))}
            </>
          }
          onClick={() => handlePageMove(`/crews/${crew.id}`, { scroll: false })}
        />
      ))}
    </div>
  );
};

export default CrewList;
