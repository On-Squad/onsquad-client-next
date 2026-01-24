import React, { ReactNode } from 'react';

import { Appbar } from '../Appbar';

interface LayoutPropsType {
  children: ReactNode | ReactNode[];
}

const Wrapper = ({ children }: LayoutPropsType) => {
  return <main className="relative mx-auto min-w-[20rem] max-w-[45rem]">{children}</main>;
};

export default Wrapper;
