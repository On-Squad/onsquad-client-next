'use client';

import React from 'react';
import { TextEditor } from '@/shared/ui/TextEditor';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Label } from '@/shared/ui/ui/label';
import { Input } from '@/shared/ui/Input';

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
    <div className="container px-0 pt-20 overflow-hidden">
      <div className="flex flex-col px-4">
        <FormProvider {...method}>
          <Input name="title" type="text" label="제목" />

          <TextEditor />
        </FormProvider>
      </div>
    </div>
  );
};
