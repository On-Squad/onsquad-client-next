'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { Searchbar } from '@/shared/ui/Searchbar';
import { searchSchema } from '@/shared/ui/Searchbar/validator';

const SearchContainer = () => {
  const method = useForm({
    resolver: zodResolver(searchSchema),
    values: {
      search: '',
    },
  });

  return (
    <FormProvider {...method}>
      <Searchbar className="border-[#d9d9d9]" />
    </FormProvider>
  );
};

export default SearchContainer;
