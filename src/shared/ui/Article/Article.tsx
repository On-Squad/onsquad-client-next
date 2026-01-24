import { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

export interface ArticlePropsType {
  slot: ReactNode | ReactNode[];
  className?: string;
}

const Article = ({ slot, className }: ArticlePropsType) => {
  return <article className={cn(`rounded-xl bg-white p-6 ${className}`)}>{slot}</article>;
};

export default Article;
