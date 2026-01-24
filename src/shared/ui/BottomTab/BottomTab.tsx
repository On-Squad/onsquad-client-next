'use client';

import { usePathname } from 'next/navigation';

import React from 'react';

import { useModalStackStore } from '@/store/useModalStackStore';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

import { PATH } from '@/shared/config/paths';
import { TAB_MENUS } from '@/shared/config/tabs';
import { cn } from '@/shared/lib/utils';

import { Alert } from '../Alert';
import { BUTTON } from '../Alert/style';
import { Button } from '../ui/button';

const BottomTab = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const setModal = useModalStackStore((state) => state.pushModal);
  const onClose = useModalStackStore((state) => state.popModal);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 mx-auto flex min-w-[20rem] max-w-[45rem] bg-white shadow-md">
      {TAB_MENUS.map((item) => {
        const { location, ...rest } = item;

        const isActive = pathname === location;

        if (!session && location === '/crews') {
          return (
            <div
              key={item.location}
              className={cn(
                `relative flex w-[33%] flex-grow cursor-pointer flex-col items-center justify-center gap-1 py-3 text-center text-black no-underline ${
                  isActive && 'rounded-md bg-primary text-primary'
                }`,
              )}
              onClick={() =>
                !session && location === PATH.crews
                  ? setModal(
                      <Alert
                        title="로그인이 필요한 서비스에요."
                        buttonSlot={
                          <div className="grid grid-cols-2">
                            <Button className={BUTTON.CANCEL} onClick={onClose}>
                              이전으로
                            </Button>
                            <Button
                              className={BUTTON.ACTION}
                              onClick={() => {
                                onClose();

                                window.location.href = PATH.login;
                              }}
                            >
                              로그인
                            </Button>
                          </div>
                        }
                      >
                        <div className="flex flex-col gap-2">
                          <span className="text-lg font-semibold text-grayscale700">로그인 후 다시 시도해주세요.</span>
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <span className="text-grayscale700">아직 회원이 아니신가요?</span>
                            <span
                              className="cursor-pointer text-blue400 underline"
                              onClick={() => {
                                onClose();

                                window.location.href = PATH.join;
                              }}
                            >
                              회원가입
                            </span>
                          </div>
                        </div>
                      </Alert>,
                    )
                  : null
              }
            >
              <Image
                src={isActive ? rest.active : rest.inActive}
                alt={rest.alt}
                width={20}
                height={20}
                priority
                style={{ width: 'auto', height: 'auto' }}
              />

              <span className={cn(`text-[0.78rem] ${isActive ? 'bg-primary text-primary' : 'text-gray-400'}`)}>
                {rest.menu}
              </span>
            </div>
          );
        } else {
          return (
            <Link
              key={item.location}
              href={item.location}
              scroll={false}
              className={cn(
                `relative flex w-[33%] flex-grow cursor-pointer flex-col items-center justify-center gap-1 py-3 text-center text-black no-underline ${
                  isActive && 'rounded-md text-primary'
                }`,
              )}
            >
              <Image
                src={isActive ? rest.active : rest.inActive}
                alt={rest.alt}
                width={20}
                height={20}
                priority
                style={{ width: 'auto', height: 'auto' }}
              />

              <span className={cn(`text-[0.78rem] ${isActive ? 'text-primary' : 'text-gray-400'}`)}>{rest.menu}</span>
            </Link>
          );
        }
      })}
    </div>
  );
};

export default BottomTab;
