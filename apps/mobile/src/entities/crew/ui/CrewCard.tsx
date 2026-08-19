import type { ReactNode } from 'react';
import { Image, Pressable, View } from 'react-native';

import MOCK_CREW_IMAGE from '../../../assets/images/mock1.png';
import { Avatar } from '../../../shared/ui/Avatar';
import { Text } from '../../../shared/ui/Text';

interface CrewCardProps {
  /** 카드 타이틀 */
  title: string;
  /** 크루 대표이미지 */
  crewImage?: string;
  /** 프로필이미지 */
  userImage?: string;
  /** 크루 소개글 */
  description: string;
  /** 크루장 이름 */
  ownerName: string;
  /** 태그 슬롯 */
  tagSlot: ReactNode;
  onPress?: () => void;
}

/** 웹 `h-[15rem]` = 240dp. */
const IMAGE_HEIGHT = 240;

/**
 * 웹 `shared/ui/Card/CrewCard` 의 RN 미러.
 *
 * 세로형 카드다 — 위에 대표 이미지, 그 아래 제목 오버레이, 그 밑에 크루장·소개·태그 줄.
 * (Phase 1.5 스파이크의 가로형 소형 카드를 웹 구조로 다시 썼다.)
 *
 * 제목 오버레이의 그라디언트·`backdrop-blur` 는 NativeWind 가 지원하지 않아 단색으로 간다.
 * 이미지가 없으면 웹과 **같은 파일**(`mock1.png`)로 대체한다.
 */
export function CrewCard({ title, crewImage, userImage, description, ownerName, tagSlot, onPress }: CrewCardProps) {
  return (
    <Pressable className="w-full overflow-hidden rounded-2xl bg-white" onPress={onPress}>
      <View className="w-full overflow-hidden rounded-t-lg" style={{ height: IMAGE_HEIGHT }}>
        <Image
          source={crewImage ? { uri: crewImage } : MOCK_CREW_IMAGE}
          className="h-full w-full"
          resizeMode="cover"
        />

        <View className="absolute bottom-0 left-0 w-full bg-black/40 p-2">
          <Text.xl className="font-bold text-white" numberOfLines={1}>
            {title}
          </Text.xl>
        </View>
      </View>

      <View className="flex-col gap-2 p-2">
        <View className="flex-row items-center gap-2">
          <Avatar className="h-5 w-5" imageUrl={userImage} />
          <Text.sm className="font-semibold text-black">{ownerName}</Text.sm>
        </View>

        <Text.sm className="font-medium text-black" numberOfLines={1}>
          {description}
        </Text.sm>
      </View>

      {/* 웹은 가로 스크롤이지만 RN 목록 안의 가로 스크롤은 세로 제스처와 충돌한다 — 줄바꿈으로 둔다 */}
      <View className="flex-row flex-wrap gap-1 px-2 pb-1.5">{tagSlot}</View>
    </Pressable>
  );
}
