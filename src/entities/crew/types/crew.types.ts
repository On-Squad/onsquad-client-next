import { CrewDetailResponseProps } from '@/shared/api/crew/crewDetailGetFetch';
import { CrewHomeInfoResponseProps } from '@/shared/api/crew/crewHomeInfoGetFetch';
import { CrewListResponseProps } from '@/shared/api/crew/crewListGetFetch';

export type CrewDetailDataType = PropType<CrewDetailResponseProps, 'data'>;
export type CrewHomeDataType = PropType<CrewHomeInfoResponseProps, 'data'>;
export type CrewListDataType = PropType<CrewListResponseProps, 'data'>;
