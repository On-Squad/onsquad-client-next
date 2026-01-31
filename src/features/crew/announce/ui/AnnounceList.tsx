'use client';

import { useRouter } from 'next/navigation';

import dayjs from 'dayjs';
import { isEmpty } from 'es-toolkit/compat';
import { PencilLine, Star } from 'lucide-react';

import { type CrewAnnounceListData } from '@/entities/crew';

import { cn } from '@/shared/lib/utils';
import { Article } from '@/shared/ui/Article';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { PostButton } from '@/shared/ui/PostButton';
import { Text } from '@/shared/ui/Text';
import { ScrollArea } from '@/shared/ui/ui/scroll-area';

interface AnnounceListProps {
  data?: CrewAnnounceListData;
  crewId: number;
}

export const AnnounceList = ({ data, crewId }: AnnounceListProps) => {
  const router = useRouter();

  const canWrite = data?.canWrite ?? false;
  const announces = data?.announces ?? [];

  const isEmptyAnnounces = isEmpty(announces);

  return (
    <div className="-mx-5 -mt-9 overflow-hidden">
      <div className="mx-5 S2:mx-0 SE:mx-0 mobile:mx-0 tablet:mx-0">
        <Article
          className="h-fit w-full p-3"
          slot={
            <>
              <div className="flex items-center justify-between">
                <Text.lg className="font-bold">
                  <h5>공지사항</h5>
                </Text.lg>

                {canWrite && (
                  <PostButton
                    className="border border-primary px-2 py-0.5"
                    onPageMove={() => router.push(`/crews/${crewId}/announce/write`, { scroll: false })}
                  >
                    <PencilLine size={12} strokeWidth={2} />
                    <Text.xxs className="ml-1 font-bold">글쓰기</Text.xxs>
                  </PostButton>
                )}
              </div>
              <ScrollArea className="mt-6 h-[80dvh]">
                <ul className="flex flex-col px-4">
                  {isEmptyAnnounces ? (
                    <li>
                      <Text.xl> 등록된 공지사항이 없어요.</Text.xl>
                    </li>
                  ) : (
                    announces.map((announce, index) => (
                      <li
                        key={index}
                        className="cursor-pointer"
                        onClick={() => router.push('/crews/1/announce', { scroll: false })}
                      >
                        <div
                          className={cn(
                            'border-grayScale400 mt-2 flex flex-col justify-center gap-2 border-t',
                            index === 0 && 'border-none',
                          )}
                        >
                          <div className="mt-2 flex justify-between">
                            <Text.base className="font-semibold">{announce.title}</Text.base>
                            {announce.fixed && <Star size={16} fill="#FFCD29" stroke="#FFCD29" />}
                          </div>
                          <div className="footer flex items-center justify-between">
                            <div className="flex items-center gap-[3px]">
                              <div className="flex items-center gap-0.5">
                                <Avatar className="h-4 w-4" />
                                <Text.xs className="pt-[0.05rem]">
                                  {announce.writer.nickname} {announce.writer.role}
                                </Text.xs>
                              </div>
                              <Badge className="px-0.5 py-0">
                                <Text.xxs>{announce.writer.nickname}</Text.xxs>
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
                  )}
                </ul>
              </ScrollArea>
            </>
          }
        />
      </div>
    </div>
  );
};
