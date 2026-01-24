'use client';

import { useRouter } from 'next/navigation';

import React, { useLayoutEffect } from 'react';

import { PencilLine, Star } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Article } from '@/shared/ui/Article';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { PostButton } from '@/shared/ui/PostButton';
import { Text } from '@/shared/ui/Text';
import { ScrollArea } from '@/shared/ui/ui/scroll-area';

export const AnnounceList = () => {
  const router = useRouter();

  useLayoutEffect(() => {
    const body = document.body;

    body.style.backgroundColor = '#F9FAFB';

    return () => {
      body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="container overflow-hidden px-0 pt-14">
      <div className="mx-5 mt-6 S2:mx-0 SE:mx-0 mobile:mx-0 tablet:mx-0">
        <Article
          className="min-h-[360px] w-full p-3"
          slot={
            <>
              <div className="flex items-center justify-between">
                <Text.lg className="font-bold">
                  <h5>공지사항</h5>
                </Text.lg>

                <PostButton
                  className="border border-primary px-2 py-0.5"
                  onPageMove={() => alert('글쓰기 페이지 Navigate')}
                >
                  <PencilLine size={12} strokeWidth={2} />
                  <Text.xxs className="ml-1 font-bold">글쓰기</Text.xxs>
                </PostButton>
              </div>
              <ScrollArea className="mt-6 h-[68dvh]">
                <ul className="flex flex-col px-4">
                  {Array.from({ length: 20 }).map((_, index) => (
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
                          <Text.base className="font-semibold">크루 규정 안내(신규 크루원 필독)</Text.base>
                          <Star size={16} fill="#FFCD29" stroke="#FFCD29" />
                        </div>
                        <div className="footer flex items-center justify-between">
                          <div className="flex items-center gap-[3px]">
                            <div className="flex items-center gap-0.5">
                              <Avatar className="h-4 w-4" />
                              <Text.xs className="pt-[0.05rem]">홍길동 크루장</Text.xs>
                            </div>
                            <Badge className="px-0.5 py-0">
                              <Text.xxs>크루장</Text.xxs>
                            </Badge>
                          </div>
                          <div>
                            <Text.xs className="text-grayscale500">2024-10-12</Text.xs>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </>
          }
        />
      </div>
    </div>
  );
};
