import React from 'react';

import { FormProvider, useFormContext } from 'react-hook-form';

import { Searchbar } from '@/shared/ui/Searchbar';

const Search = () => {
  const method = useFormContext();

  return (
    <FormProvider {...method}>
      <Searchbar />
    </FormProvider>
  );
};

export default Search;
