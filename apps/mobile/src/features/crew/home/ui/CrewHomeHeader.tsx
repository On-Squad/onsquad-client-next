import { Image, Pressable, View } from 'react-native';

import { Settings } from 'lucide-react-native';

import type { CrewHomeData } from '@/entities/crew';

import MOCK_CREW_IMAGE from '../../../../assets/images/mock1.png';
import { useCrewImageHeight } from '../../../../shared/lib/useCrewImageHeight';
import { Text } from '../../../../shared/ui/Text';

interface CrewHomeHeaderProps {
  crew?: CrewHomeData['crew'];
  canManage?: boolean;
}

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외).
const SETTINGS_COLOR = '#FFFFFF';

const SETTINGS_SIZE = 20;

/**
 * 웹 `features/crew/home/ui/CrewHeader` 의 RN 미러.
 *
 * 높이는 웹과 같은 식(`50dvh - --app-header-height`)을 `useCrewImageHeight` 가 계산한다.
 * 고정값으로 두면 화면 크기에 따라 웹과 크게 어긋난다.
 *
 * 이미지 폴백은 웹과 **같은 파일**(`mock1.png`)을 번들해서 쓴다 — 웹이 `imageUrl || '/images/mock1.png'` 다.
 *
 * 오버레이만 웹 상수(`CREW_IMAGE_OVERLAY_CLASS`)를 쓰지 않는다.
 * 그 상수에는 `bg-gradient-to-t` 와 `backdrop-blur-sm` 이 들어 있는데
 * **NativeWind 가 둘 다 지원하지 않는다.** 단색 반투명으로 간다.
 *
 * 관리 버튼은 **모양만 두고 동작을 비운다** — 크루 관리 화면은 이번 범위가 아니다.
 */
export function CrewHomeHeader({ crew, canManage }: CrewHomeHeaderProps) {
  const imageHeight = useCrewImageHeight();

  return (
    <View className="w-full overflow-hidden bg-white" style={{ height: imageHeight }}>
      <Image
        source={crew?.imageUrl ? { uri: crew.imageUrl } : MOCK_CREW_IMAGE}
        className="h-full w-full"
        resizeMode="cover"
      />

      <View className="absolute bottom-0 left-0 w-full flex-col gap-3 bg-black/40 px-5 py-2">
        <View className="flex-row items-center justify-between">
          <Text.base className="font-medium text-white">크루 스페이스</Text.base>

          {canManage ? (
            <Pressable className="px-2" hitSlop={8}>
              <Settings size={SETTINGS_SIZE} color={SETTINGS_COLOR} />
            </Pressable>
          ) : null}
        </View>

        <Text.xl className="font-semibold text-white">{crew?.name}</Text.xl>
      </View>
    </View>
  );
}
