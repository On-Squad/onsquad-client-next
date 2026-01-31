'use client';

import { useRouter } from 'next/navigation';

import { CircleCheck } from 'lucide-react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { PATH } from '@/shared/config/paths';
import { TOAST } from '@/shared/config/toast';
import { useToast } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Spinner } from '@/shared/ui/Spinner';
import { TextEditor } from '@/shared/ui/TextEditor';

import { useAnnounceRegisterMutation } from '../model/useAnnounceRegisterMutation';

export const WriteForm = ({ crewId }: { crewId: number }) => {
  const router = useRouter();

  const { toast } = useToast();

  const method = useForm({
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const { handleSubmit: submit, getValues } = method;

  const { mutateAsync: registerAnnounce, isPending: isRegisterPending } = useAnnounceRegisterMutation({ crewId });

  const handleSubmit = submit(async () => {
    await registerAnnounce(getValues());

    toast({
      title: '공지사항이 등록되었어요.',
      icon: <CircleCheck />,
      className: TOAST.success,
    });

    router.replace(`${PATH.crews}/${crewId}/announce`, {
      scroll: false,
    });
  });

  return (
    <>
      {isRegisterPending ? <Spinner /> : null}
      <div className="overflow-hidden px-0">
        <div className="flex flex-col gap-6 px-4 pb-10">
          <FormProvider {...method}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input name="title" type="text" label="제목" placeholder="제목을 입력하세요" />

              <div>
                {/* <label className="mb-2 block text-sm font-medium">내용</label> */}
                <Controller
                  name="content"
                  control={method.control}
                  render={({ field: { onChange, value } }) => (
                    <TextEditor
                      value={value}
                      onChange={(val) => onChange(val?.trim())}
                      placeholder="공지사항을 작성해주세요."
                    />
                  )}
                />
              </div>

              <div className="flex items-center border-t pt-4">
                <Button isLoading={isRegisterPending} className="w-full" type="submit">
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
