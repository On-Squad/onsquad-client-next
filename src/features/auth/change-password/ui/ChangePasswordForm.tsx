'use client';

import React, { useLayoutEffect } from 'react';

import { isEmpty } from 'es-toolkit/compat';

import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { changePasswordSchema } from '../model/changePasswordSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/shared/ui/ui/button';
import { Loader2 } from 'lucide-react';
import { useChangePasswordMutation } from '../model/useChangePasswordMutation';
import { Input } from '@/shared/ui/Input';

const ChangePasswordForm = () => {
  const method = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    },
    mode: 'onChange',
  });

  const {
    handleSubmit: submit,
    getValues,
    control,
    formState: { errors },
  } = method;

  const [currentPassword, newPassword, newPasswordConfirm] = useWatch({
    control,
    name: ['currentPassword', 'newPassword', 'newPasswordConfirm'],
  });

  const { mutateAsync: changePassword, isPending } = useChangePasswordMutation();

  const isEmptyValue = isEmpty(currentPassword) || isEmpty(newPassword) || isEmpty(newPasswordConfirm);

  const isError =
    errors.currentPassword || errors.newPassword || errors.newPasswordConfirm;

  const handleSubmit = submit(async () => await changePassword(getValues()))

  useLayoutEffect(() => {
    const body = document.body;

    body.style.backgroundColor = '#f8f8f8';

    return () => {
      body.style.backgroundColor = '';
    };
  }, []);

  return (
    <FormProvider {...method}>
      <form
        className="flex flex-col gap-6 items-center mt-4"
        onSubmit={handleSubmit}
      >
        <Input
          name="currentPassword"
          type="password"
          label="현재 비밀번호"
          placeholder="현재 비밀번호"
        />

        <Input
          name="newPassword"
          type="password"
          label="새로운 비밀번호"
          placeholder="새로운 비밀번호"
        />

        <Input
          name="newPasswordConfirm"
          type="password"
          label="비밀번호 확인"
          placeholder="비밀번호 확인"
        />

        <Button
          className="w-full disabled:bg-grayscale200 disabled:text-grayscale600 disabled:cursor-not-allowed"
          formAction="submit"
          disabled={
            isPending || isEmptyValue || isError === undefined ? false : true
          }
        >
          {isPending ? (
            <div className="flex items-center gap-1 justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              변경 사항을 저장 중이에요 ...
            </div>
          ) : (
            '저장하기'
          )}
        </Button>
      </form>
    </FormProvider>
  );
};

export default ChangePasswordForm;
