'use client';

import React from 'react';

import { Controller, FormProvider, useForm } from 'react-hook-form';

import { Input } from '@/shared/ui/Input';
import { TextEditor } from '@/shared/ui/TextEditor';
import { Label } from '@/shared/ui/ui/label';

export const WriteForm = () => {
  const method = useForm({
    defaultValues: {
      title: '',
      contents: '',
    },
  });

  const {
    handleSubmit: submit,
    control,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = method;

  return (
    <div className="container overflow-hidden px-0 pt-20">
      <div className="flex flex-col px-4">
        <FormProvider {...method}>
          <Input name="title" type="text" label="제목" />

          <TextEditor />
        </FormProvider>
      </div>
    </div>
  );
};
