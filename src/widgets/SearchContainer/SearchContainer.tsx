'use client';

import { useRouter } from 'next/navigation';

import React, { FormEventHandler } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';

import { Searchbar } from '@/shared/ui/Searchbar';
import { searchSchema } from '@/shared/ui/Searchbar/validator';

const SearchContainer = () => {
  const router = useRouter();

  const method = useForm({
    resolver: yupResolver(searchSchema),
    values: {
      search: '',
    },
  });

  return (
    <FormProvider {...method}>
      <Searchbar
        className="border-[#d9d9d9]"
        onSubmit={async () => {
          alert('검색기능');
        }}
      />
    </FormProvider>
  );
};

export default SearchContainer;
