'use client';

import { Slider } from '@/shared/ui/Slider';

import { CrewAnnounceList } from './CrewAnnounceList';
import { CrewInfoSection } from './CrewInfoSection';

interface AnnounceItem {
  fixed: boolean;
  createdAt: string;
  memberInfo: {
    nickname: string;
  };
}

interface CrewInfoSliderProps {
  announces?: AnnounceItem[];
  crewInfo?: {
    id: number;
    name: string;
    owner: {
      nickname: string;
    };
    introduce: string;
    detail: string;
    hashtags: string[];
  };
}

export const CrewInfoSlider = ({ announces, crewInfo }: CrewInfoSliderProps) => {
  return (
    <Slider
      slot={[
        <CrewAnnounceList key="notice" announces={announces} crewId={crewInfo?.id} />,
        <CrewInfoSection key="info" crew={crewInfo} />,
      ]}
    />
  );
};
