'use client';

import { useRouter } from 'next/navigation';

import { useLayoutEffect } from 'react';

import dayjs from 'dayjs';
import { Plus, Settings, Star } from 'lucide-react';
import Image from 'next/image';

import type { CrewHomeDataType } from '@/entities/crew';

import { cn } from '@/shared/lib/utils';
import { Article } from '@/shared/ui/Article';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { PostButton } from '@/shared/ui/PostButton';
import { Slider } from '@/shared/ui/Slider';
import { Text } from '@/shared/ui/Text';
import { Button } from '@/shared/ui/ui/button';

interface CrewHomeProps {
  data?: CrewHomeDataType;
}

export const CrewHome = ({ data }: CrewHomeProps) => {
  const router = useRouter();

  useLayoutEffect(() => {
    const body = document.body;

    body.style.backgroundColor = '#F9FAFB';

    return () => {
      body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="container min-h-[calc(100vh)] px-0 pt-14">
      <div className="w-full cursor-pointer bg-white transition-all duration-200 hover:shadow-md S2:w-full SE:w-full mobile:w-full tablet:w-full">
        <div className="relative h-[360px] w-full overflow-hidden S2:w-full SE:w-full mobile:w-full tablet:w-full">
          <Image
            src={data?.crew?.imageUrl || '/images/mock1.png'}
            alt="크루이미지"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full px-4"
          />
          <div className="bg-gradient-to-t absolute bottom-0 left-0 flex w-full flex-col gap-3 overflow-hidden truncate bg-black bg-opacity-20 from-black via-black/30 to-transparent px-5 py-2 font-bold text-white backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <Text.base className="font-medium">크루 스페이스</Text.base>

              <Button
                variant="ghost"
                className="px-2 text-grayscale50 hover:bg-[0] hover:text-inherit active:scale-110 active:bg-[0]"
              >
                <Settings size={20} />
              </Button>
            </div>
            <Text.xl className="font-semibold">{data?.crew?.name}</Text.xl>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Slider
          slot={[
            <Article
              key="notice"
              className="min-h-[360px] w-full p-3"
              slot={
                <>
                  <div className="flex items-center justify-between">
                    <Text.lg className="font-bold">
                      <h5>공지사항</h5>
                    </Text.lg>

                    <Button
                      className="text-grayscale500 hover:bg-[0] hover:text-grayscale600 active:scale-110 active:bg-[0] active:text-grayscale600"
                      variant="ghost"
                    >
                      <Text.xs>더보기</Text.xs>
                    </Button>
                  </div>
                  <ul className="mt-8 flex flex-col">
                    {data && data.announces.length > 0 ? (
                      data?.announces.map((announce, index) => (
                        <li
                          key={index}
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(`/crews/${data.crew.id}/announce`, {
                              scroll: false,
                            })
                          }
                        >
                          <div
                            className={cn(
                              'border-grayScale400 mt-2 flex flex-col justify-center gap-2 border-t',
                              index === 0 && 'border-none',
                            )}
                          >
                            <div className="mt-2 flex justify-between">
                              <Text.base className="font-semibold">크루 규정 안내(신규 크루원 필독)</Text.base>
                              {announce.fixed && <Star size={16} fill="#FFCD29" stroke="#FFCD29" />}
                            </div>
                            <div className="footer flex items-center justify-between">
                              <div className="flex items-center gap-[3px]">
                                <div className="flex items-center gap-0.5">
                                  <Avatar className="h-4 w-4" />
                                  <Text.xs className="pt-[0.05rem]">{announce.memberInfo.nickname}</Text.xs>
                                </div>
                                <Badge className="px-0.5 py-0">
                                  <Text.xxs>크루장</Text.xxs>
                                </Badge>
                              </div>
                              <div>
                                <Text.xs className="text-grayscale500">
                                  {dayjs(announce.createdAt).format('YYYY년 MM월 DD일')}
                                </Text.xs>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li>
                        <Text.xl> 등록된 공지사항이 없어요.</Text.xl>
                      </li>
                    )}
                  </ul>
                </>
              }
            />,
            <Article
              key="info"
              className="min-h-[360px] w-full p-3"
              slot={
                <div className="flex min-h-[360px] flex-col gap-3">
                  <Text.lg className="mb-1 font-bold">
                    <h5>{data?.crew.name}</h5>
                  </Text.lg>

                  <div className="flex items-center gap-2">
                    <Text.base className="font-semibold">크루장</Text.base>
                    <div className="flex gap-1">
                      <Avatar className="h-4 w-4" />
                      <Text.xs className="pt-[0.05rem] font-medium">{data?.crew.crewOwner.nickname}</Text.xs>
                    </div>
                  </div>
                  <div>
                    <Text.xs>{data?.crew.introduce}</Text.xs>
                  </div>

                  <div className="mt-1 flex gap-1">
                    <Text.base className="mb-1 font-semibold">
                      <h5>크루 상세정보</h5>
                    </Text.base>
                  </div>

                  <div>
                    <Text.xs>{data?.crew.detail}</Text.xs>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-1">
                    {data?.crew.hashtags.map((tag, index) => {
                      if (index === 0) {
                        return <Badge key={index}>멤버 수 {tag}+</Badge>;
                      }
                      return <Badge key={index}>{tag}</Badge>;
                    })}
                  </div>
                </div>
              }
            />,
          ]}
        />
        <div className="mx-5 mt-9 flex flex-col items-center gap-6">
          <Article
            className="w-full p-3"
            slot={
              <>
                <div className="flex items-center justify-between">
                  <Text.lg className="font-semibold">
                    <h5>크루원 활동 랭킹</h5>
                  </Text.lg>

                  <Button
                    className="active:text-grayscale60 text-grayscale500 hover:bg-[0] hover:text-grayscale600 active:scale-110 active:bg-[0]"
                    variant="ghost"
                  >
                    <Text.xs>랭킹 더보기</Text.xs>
                  </Button>
                </div>
                <div className="mt-6">
                  <ul>
                    {data?.topMembers.map((member, index) => (
                      <li key={index}>
                        <div
                          className={cn(
                            'border-grayScale400 flex items-center gap-3 border-t py-2',
                            index === 0 && 'border-none',
                          )}
                        >
                          <Text.xs className="inline-block font-bold">{member.rank}위</Text.xs>
                          <div className="flex items-center gap-[3px]">
                            <div className="flex items-center gap-0.5">
                              <Avatar className="mr-1 h-5 w-5" />
                              <Text.base className="pt-[0.09rem] font-semibold">{member.nickname}</Text.base>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            }
          />

          <div className="w-full">
            <div className="mb-3 flex items-center justify-between">
              <Text.lg className="font-bold">
                <h5>모집중인 스쿼드</h5>
              </Text.lg>
              <PostButton className="border border-primary" onPageMove={() => alert('스쿼드 모집하기')}>
                <Text.xxs className="ml-1 font-bold">스쿼드 모집하기</Text.xxs>
                <Plus className="pb-0.5" size={10} strokeWidth={2} />
              </PostButton>
            </div>

            <div className="flex flex-col gap-3 pb-10">
              {data?.squads.map((squad, index) => (
                <Card
                  key={index}
                  onClick={() => alert('cardlist fuck')}
                  title={
                    <div className="flex items-center justify-between">
                      <Text.sm className="py-3 font-bold">
                        <h5>{squad.title}</h5>
                      </Text.sm>
                      <div className="flex items-center gap-2">
                        {squad.categories.slice(0, 2).map((tag, index) => (
                          <Badge key={index}>{tag}</Badge>
                        ))}
                        <Badge>
                          {squad.remain}/{squad.capacity} 명
                        </Badge>
                      </div>
                    </div>
                  }
                >
                  <div className="flex gap-1">
                    <Avatar className="h-4 w-4" />
                    <Text.xs className="pt-[0.05rem] font-medium">{squad.squadOwner.nickname}</Text.xs>
                  </div>
                  <div className="mt-2 line-clamp-4 max-h-14 text-ellipsis">
                    <Text.xs className="font-medium">{squad.content}</Text.xs>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewHome;
