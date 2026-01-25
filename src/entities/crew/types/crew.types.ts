import { CrewDetailResponseProps } from '@/shared/api/crew/crewDetailGetFetch';
import { CrewHomeInfoResponseProps } from '@/shared/api/crew/crewHomeInfoGetFetch';
import { CrewListResponseProps } from '@/shared/api/crew/crewListGetFetch';

export type CrewDetailData = PropType<CrewDetailResponseProps, 'data'>;
export type CrewHomeData = PropType<CrewHomeInfoResponseProps, 'data'>;
export type CrewListData = PropType<CrewListResponseProps, 'data'>;
