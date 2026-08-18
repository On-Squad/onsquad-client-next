import { FlatList, View, useWindowDimensions } from 'react-native';

import type { CrewHomeData } from '@/entities/crew';

import { CrewAnnouncePanel } from './CrewAnnouncePanel';
import { CrewInfoPanel } from './CrewInfoPanel';

interface CrewInfoPagerProps {
  announces?: CrewHomeData['announces'];
  crew?: CrewHomeData['crew'];
}

type PanelKey = 'announce' | 'info';

const PANEL_KEYS: PanelKey[] = ['announce', 'info'];

// 웹 Slider 의 `px-5` 에 대응한다. 페이지 폭에서 이만큼을 뺀다.
const PAGE_PADDING = 20;

/**
 * 웹 `features/crew/home/ui/CrewInfoSlider` 의 RN 대응물.
 *
 * 웹은 embla 캐러셀을 쓰지만 RN 대응물이 `react-native-reanimated` 를 요구한다 —
 * Phase 3 에서 그 패키지 때문에 앱이 죽었고(pod 미설치) 지금도 상황이 같다.
 * 패널이 **2장뿐**이라 `pagingEnabled` 로 충분하다. 자동재생·도트는 웹 Slider 에도 없다.
 */
export function CrewInfoPager({ announces, crew }: CrewInfoPagerProps) {
  const { width } = useWindowDimensions();
  // 화면 폭에서 좌우 여백을 뺀 계산값이라 Tailwind 클래스로 표현할 수 없다.
  const pageWidth = width - PAGE_PADDING * 2;

  return (
    <FlatList
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      data={PANEL_KEYS}
      keyExtractor={(key) => key}
      contentContainerClassName="px-s-20"
      renderItem={({ item }) => (
        <View style={{ width: pageWidth }}>
          {item === 'announce' ? <CrewAnnouncePanel announces={announces} /> : <CrewInfoPanel crew={crew} />}
        </View>
      )}
    />
  );
}
