'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { CircleCheck, CircleX } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { crewQueries } from '@/entities/crew';

import { shellContentReady } from '@/shared/lib/bridge';

import { TOAST } from '@/shared/config/toast';
import { useToast } from '@/shared/lib';
import { usePageMove } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Spinner } from '@/shared/ui/Spinner';
import { TextEditor } from '@/shared/ui/TextEditor';

import { ANNOUNCE_REDIRECT_PATH, ANNOUNCE_TOAST } from '../config';
import { announceSchema } from '../model/announceSchema';
import { useAnnounceRegisterMutation } from '../model/useAnnounceRegisterMutation';
import { useAnnounceUpdateMutation } from '../model/useAnnounceUpdateMutation';

interface WriteFormProps {
  crewId: number;
  announceId?: number;
  mode: 'add' | 'edit';
}

export const WriteForm = ({ crewId, announceId, mode }: WriteFormProps) => {
  const { handleReplace } = usePageMove();

  const { toast } = useToast();

  const { data: announceDetailRes } = useQuery({
    ...crewQueries.announceDetail({ crewId, announceId: announceId ?? 0 }),
    enabled: mode === 'edit',
  });

  const data = announceDetailRes?.data;

  // 셸 스켈레톤을 내릴 시점. 작성은 받아올 게 없어 폼이 뜨는 즉시,
  // 수정은 기존 내용을 채운 뒤여야 빈 폼이 먼저 보이지 않는다.
  const isContentReady = mode === 'add' || data !== undefined;

  useEffect(() => {
    if (isContentReady) shellContentReady();
  }, [isContentReady]);

  const method = useForm({
    resolver: zodResolver(announceSchema),
    values: {
      title: data?.title ?? '',
      content: data?.content ?? '',
    },
  });

  const { handleSubmit: submit } = method;

  const { mutateAsync: registerAnnounce, isPending: isRegisterPending } = useAnnounceRegisterMutation({ crewId });

  const { mutateAsync: updateAnnounce, isPending: isUpdatePending } = useAnnounceUpdateMutation({
    crewId,
    announceId: announceId ?? 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await submit(
        async (data) => {
          if (mode === 'edit') {
            await updateAnnounce(data);
          } else {
            await registerAnnounce(data);
          }

          toast({
            title: ANNOUNCE_TOAST[mode],
            icon: <CircleCheck />,
            className: TOAST.success,
          });

          handleReplace(ANNOUNCE_REDIRECT_PATH[mode](crewId, announceId ?? 0), {
            scroll: false,
          });
        },
        (errors) => {
          const firstError = Object.values(errors)?.[0]?.message;

          if (firstError) {
            toast({
              title: firstError as string,
              icon: <CircleX />,
              className: TOAST.error,
            });
          }
        },
      )(e);
    } catch (error) {
      console.error('Form error:', error);
    }
  };

  return (
    <>
      {isRegisterPending ? <Spinner /> : null}
      <div className="h-full overflow-hidden px-0">
        <div className="flex h-full flex-col gap-6 px-4">
          <FormProvider {...method}>
            <form onSubmit={handleSubmit} className="flex h-full grow flex-col justify-between space-y-6">
              <Input name="title" type="text" label="제목" placeholder="제목을 입력하세요" />

              <div className="grow">
                <Controller
                  name="content"
                  control={method.control}
                  render={({ field: { onChange, value } }) => (
                    <TextEditor
                      value={value}
                      onChange={(val) => onChange(val?.trim() ?? '')}
                      placeholder="공지사항을 작성해주세요."
                    />
                  )}
                />
              </div>

              <div className="flex items-center border-t pt-4">
                <Button isLoading={isRegisterPending || isUpdatePending} className="w-full" type="submit">
                  저장
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </>
  );
};
