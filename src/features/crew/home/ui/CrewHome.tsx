'use client';

import type { CrewHomeData } from '@/entities/crew';

import { CrewHeader } from './CrewHeader';
import { CrewInfoSlider } from './CrewInfoSlider';
import { CrewMemberRanking } from './CrewMemberRanking';
import { CrewSquadList } from './CrewSquadList';

interface CrewHomeProps {
  data?: CrewHomeData;
}

export const CrewHome = ({ data }: CrewHomeProps) => {
  return (
    <div className="-mx-5 -mt-12">
      <CrewHeader crew={data?.crew} />
      <div className="mt-6">
        <CrewInfoSlider announces={data?.announces} crewInfo={data?.crew} />

        <div className="mx-5 mt-9 flex flex-col items-center gap-6">
          <CrewMemberRanking members={data?.topMembers} />
          <CrewSquadList squads={data?.squads} />
        </div>
      </div>
    </div>
  );
};
