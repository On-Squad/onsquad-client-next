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

/** 좌측 썸네일 한 변. */
const THUMBNAIL_SIZE = 88;

/**
 * 크루 카드 — **가로형**.
 *
 * 좌측에 작은 대표 이미지, 우측에 제목·크루장·소개·해시태그를 세로로 쌓는다.
 *
 * **웹과 의도적으로 다르다(사용자 결정).** 웹 `shared/ui/Card/CrewCard` 는
 * 대표 이미지가 15rem 인 세로형이라 카드 한 장이 화면을 거의 채운다 —
 * 목록에서 한 번에 두세 개밖에 안 보여 가독성이 떨어진다는 판단이다.
 *
 * **담는 정보는 웹과 같다** — 제목 · 크루장 · 소개 · 해시태그를 하나도 빼지 않는다.
 * 이 차이는 spec §7 에 기록한다.
 */
export function CrewCard({ title, crewImage, userImage, description, ownerName, tagSlot, onPress }: CrewCardProps) {
  return (
    <Pressable className="w-full flex-row gap-3 overflow-hidden rounded-2xl bg-white p-3" onPress={onPress}>
      <Image
        source={crewImage ? { uri: crewImage } : MOCK_CREW_IMAGE}
        className="rounded-lg"
        style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
        resizeMode="cover"
      />

      <View className="flex-1 flex-col gap-1">
        <Text.base className="font-bold text-black" numberOfLines={1}>
          {title}
        </Text.base>

        <View className="flex-row items-center gap-1">
          <Avatar className="h-4 w-4" imageUrl={userImage} />
          <Text.xs className="font-semibold text-black">{ownerName}</Text.xs>
        </View>

        <Text.xs className="font-medium text-grayscale600" numberOfLines={1}>
          {description}
        </Text.xs>

        {/* 해시태그는 웹과 같은 것을 그대로 담는다. 폭이 좁으므로 줄바꿈한다. */}
        <View className="mt-1 flex-row flex-wrap gap-1">{tagSlot}</View>
      </View>
    </Pressable>
  );
}
