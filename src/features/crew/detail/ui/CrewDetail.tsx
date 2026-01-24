'use client';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import { CircleX } from 'lucide-react';
import Image from 'next/image';

import type { CrewDetailDataType } from '@/entities/crew';

import { TOAST } from '@/shared/config/toast';
import { useToast } from '@/shared/lib/hooks/useToast';
import { cn } from '@/shared/lib/utils';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Text } from '@/shared/ui/Text';
import { Button } from '@/shared/ui/ui/button';

interface CrewDetailProps {
  data?: CrewDetailDataType;
}

export const CrewDetail = ({ data }: CrewDetailProps) => {
  const router = useRouter();

  const [isApply, setIsApply] = useState<boolean>(false);

  const { toast, hide } = useToast();

  return (
    <div className="container min-h-[90vh] bg-white px-0 pt-12">
      <div
        className="w-full cursor-pointer bg-white transition-all duration-200 hover:shadow-md S2:w-full SE:w-full mobile:w-full tablet:w-full"
        onClick={() =>
          router.push(`/crews/${data?.id}/home?category=전체`, {
            scroll: false,
          })
        }
      >
        <div className="relative h-[360px] w-full overflow-hidden S2:w-full SE:w-full mobile:w-full tablet:w-full">
          {data ? (
            <Image
              src={data.imageUrl || '/images/mock1.png'}
              alt="크루이미지"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full px-4"
            />
          ) : null}

          <div className="absolute bottom-0 left-0 flex w-full flex-col gap-3 overflow-hidden truncate bg-black bg-opacity-20 px-5 py-2 font-bold text-white backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <Text.base className="font-medium">크루 스페이스</Text.base>
              <Badge className="bg-primary text-black">모집중</Badge>
            </div>
            <Text.xl className="font-semibold">{data?.name}</Text.xl>
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="py-6">
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <h4>
                <Text.xl className="font-bold">크루장</Text.xl>
              </h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5" />
                <Text.xs className="font-semibold text-black">{data?.crewOwner?.nickname}</Text.xs>
                <Text.xs>{data?.crewOwner?.mbti ?? 'ESFP'}</Text.xs>
              </div>
            </div>
            <Text.base className="font-medium">
              <p>{data?.introduce}</p>
            </Text.base>
          </div>
        </div>

        <div className="py-6">
          <div className="flex flex-col gap-2">
            <h4>
              <Text.xl className="font-bold">크루 상세정보</Text.xl>
            </h4>
            <Text.base className="font-medium">
              <p>{data?.detail}</p>
            </Text.base>
          </div>
        </div>

        <div className="tagArea flex flex-wrap items-center gap-2 py-6">
          {data?.hashtags.map((tag, index) => {
            if (index === 0) {
              return <Badge key={index}>멤버 수 {tag}+</Badge>;
            }
            return <Badge key={index}>{tag}</Badge>;
          })}
        </div>

        <div className="buttonArea flex flex-col items-center gap-4 pb-12 pt-6">
          <Button
            className={cn(`w-full disabled:cursor-not-allowed disabled:bg-grayscale100 disabled:text-grayscale500`)}
            disabled={isApply}
            onClick={() => {
              setIsApply(true);

              toast({
                title: '가입 신청이 완료되었어요',
                icon: <CircleX onClick={() => hide()} />,
                className: TOAST.primary,
              });
            }}
          >
            {isApply ? '가입 신청 완료' : '가입 신청하기'}
          </Button>
          {isApply ? (
            <Button className="w-fit" variant="ghost" onClick={() => setIsApply(false)}>
              취소
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
