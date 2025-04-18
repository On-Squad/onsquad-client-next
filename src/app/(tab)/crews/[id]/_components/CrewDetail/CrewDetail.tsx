'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { TOAST } from '@/constants/toast';
import { CircleX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

import { CrewDetailDataType } from '../../HydrateCrewDetail';

interface CrewDetailProps {
  data?: CrewDetailDataType;
}

//TODO:// 서버 Response로 교체 필요, 자신의 크루일 경우 버튼 변경 필요
const CrewDetail = ({ data }: CrewDetailProps) => {
  const router = useRouter();

  //TODO: 신청여부 서버걸로 버튼 조건부 변경
  const [isApply, setIsApply] = useState<boolean>(false);

  const { toast, hide } = useToast();

  return (
    <div className="container pt-12 px-0 bg-white min-h-[90vh]">
      <div
        className="w-full tablet:w-full mobile:w-full SE:w-full S2:w-full bg-white cursor-pointer hover:shadow-md transition-all duration-200"
        onClick={() =>
          router.push(`/crews/${data?.id}/home?category=전체`, {
            scroll: false,
          })
        }
      >
        <div className="relative overflow-hidden w-full h-[360px] tablet:w-full mobile:w-full SE:w-full S2:w-full">
          {data ? (
            <Image
              src={data.imageUrl || '/images/mock1.png'}
              alt="크루이미지"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full px-4"
            />
          ) : null}

          <div className="flex-col absolute bottom-0 left-0 w-full py-2 px-5 flex text-white bg-black bg-opacity-20 backdrop-blur-sm font-bold overflow-hidden truncate gap-3">
            <div className="flex justify-between items-center ">
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
                <Avatar className="w-5 h-5" />
                <Text.xs className="text-black font-semibold">
                  {data?.crewOwner?.nickname}
                </Text.xs>
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
              {/* FIXME:html parse 해서 넣어야함. 크루는 제외임 */}
              <p>{data?.detail}</p>
            </Text.base>
          </div>
        </div>

        <div className="tagArea py-6 flex items-center gap-2 flex-wrap">
          {data?.hashtags.map((tag, index) => {
            if (index === 0) {
              return <Badge key={index}>멤버 수 {tag}+</Badge>;
            }
            return <Badge key={index}>{tag}</Badge>;
          })}
        </div>

        <div className="buttonArea pt-6 pb-12 flex flex-col items-center gap-4">
          <Button
            className={cn(
              `w-full disabled:bg-grayscale100 disabled:text-grayscale500 disabled:cursor-not-allowed`,
            )}
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
            <Button
              className="w-fit"
              variant="ghost"
              onClick={() => setIsApply(false)}
            >
              취소
            </Button>
          ) : null}
        </div>

        {/* <Text.sm className="overflow-hidden text-ellipsis text-black font-medium truncate">
             
            </Text.sm> */}
      </div>
    </div>
  );
};

export default CrewDetail;
