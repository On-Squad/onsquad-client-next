'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';

export interface CrewCardPropsType {
  /**
   * 카드 타이틀
   */
  title: string;

  /**
   * 크루 대표이미지
   */
  crewImage?: string;

  /**
   * 프로필이미지
   */
  userImage?: string;

  /**
   * 크루 소개글
   */
  description: string;

  /**
   * 태그 슬롯
   */
  tagSlot: ReactNode | ReactNode[];
}

/**
 * 크루카드
 * @example 
 *  <CrewCard
      title="크루명은 최대 15자 입니다."
      description="크루소개는 아무리 길어도 상관 없습니다. 크루소개는 아무리 길어도 상관 없습니다."
      tagSlot={
        <>
          {['이경학', '이경학', '이경학', '이경학', '화로상회'].map(
            (card, i) => (
              <Badge key={i}>{card}</Badge>
            ),
          )}
        </>
      }
    />
 */
const CrewCard = (props: CrewCardPropsType) => {
  const {
    title,
    crewImage = '/images/mock.png',
    userImage,
    description,
    tagSlot,
  } = props;

  return (
    <div className="w-[20rem] tablet:w-full mobile:w-full SE:w-full S2:w-full bg-white rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200">
      <div className="relative rounded-t-lg overflow-hidden w-[20rem] h-[15rem] tablet:w-full mobile:w-full SE:w-full S2:w-full">
        <Image
          src={crewImage}
          alt="크루이미지"
          fill
          className="rounded-t-lg w-full"
        />
        <Text.xl className="absolute bottom-0 left-0 w-full p-2 flex items-center text-white bg-gradient-to-t from-black via-black/30 to-transparent backdrop-blur-sm  font-bold overflow-hidden truncate">
          {title}
        </Text.xl>
      </div>
      <div className="flex flex-col p-2 gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5" imageUrl={userImage} />
          <Text.sm className="text-black font-semibold">홍길동 크루장</Text.sm>
        </div>
        <Text.sm className="overflow-hidden text-ellipsis text-black font-medium truncate">
          {description}
        </Text.sm>
      </div>
      <div className="px-2 py-1.5 overflow-x-auto whitespace-nowrap flex no-scrollbar gap-1">
        {tagSlot}
      </div>
    </div>
  );
};

export default CrewCard;
