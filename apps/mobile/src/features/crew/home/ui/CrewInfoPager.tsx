import { FlatList, View, useWindowDimensions } from 'react-native';

import type { CrewHomeData } from '../../../../entities/crew/types/crew.types';

import { CrewAnnouncePanel } from './CrewAnnouncePanel';
import { CrewInfoPanel } from './CrewInfoPanel';

interface CrewInfoPagerProps {
  announces?: CrewHomeData['announces'];
  crew?: CrewHomeData['crew'];
  /** "더보기" 눌렀을 때 공지 목록 화면으로 이동한다. */
  onMoreAnnouncePress?: () => void;
}

type PanelKey = 'announce' | 'info';

const PANEL_KEYS: PanelKey[] = ['announce', 'info'];

/** 웹 `Slider` 의 `px-5` 에 대응한다(20px). */
const SIDE_PADDING = 20;

/** 웹 shadcn Carousel 의 아이템 간격(`-ml-4` + `pl-4`)에 대응한다(16px). */
const PANEL_GAP = 16;

/**
 * 웹 `features/crew/home/ui/CrewInfoSlider` 의 RN 대응물.
 *
 * 웹은 embla 캐러셀을 쓰지만 RN 대응물이 `react-native-reanimated` 를 요구한다 —
 * Phase 3 에서 그 패키지 때문에 앱이 죽었고(pod 미설치) 지금도 상황이 같다.
 * 패널이 **2장뿐**이라 스냅 스크롤로 충분하다. 자동재생·도트는 웹 Slider 에도 없다.
 *
 * **`pagingEnabled` 를 쓰지 않는다.** 그건 항상 **FlatList 자체 폭**만큼 스크롤하는데
 * 우리 패널은 좌우 여백을 뺀 `width - 40` 이라 매 장마다 어긋난다(에뮬레이터 실측 —
 * 두 번째 패널이 오른쪽으로 밀려 끝이 잘렸다). 대신 아이템 폭에 맞춰 `snapToInterval` 을 준다.
 */
export function CrewInfoPager({ announces, crew, onMoreAnnouncePress }: CrewInfoPagerProps) {
  const { width } = useWindowDimensions();
  // 화면 폭에서 좌우 여백을 뺀 계산값이라 Tailwind 클래스로 표현할 수 없다.
  const panelWidth = width - SIDE_PADDING * 2;

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      // 아이템 1장 + 간격만큼 이동해야 다음 장이 정확히 같은 자리에 선다.
      snapToInterval={panelWidth + PANEL_GAP}
      snapToAlignment="start"
      decelerationRate="fast"
      data={PANEL_KEYS}
      keyExtractor={(key) => key}
      contentContainerStyle={{ paddingHorizontal: SIDE_PADDING, gap: PANEL_GAP }}
      renderItem={({ item }) => (
        <View style={{ width: panelWidth }}>
          {item === 'announce' ? (
            <CrewAnnouncePanel announces={announces} onMorePress={onMoreAnnouncePress} />
          ) : (
            <CrewInfoPanel crew={crew} />
          )}
        </View>
      )}
    />
  );
}
