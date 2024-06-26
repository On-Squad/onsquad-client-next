import type { Metadata } from 'next';
import Providers from '@/services/providers';
import { cn } from '@/lib/utils';
import './globals.css';

import { Wrapper } from '@/components/Wrapper';
import { ShowBottomTab } from '@/components/ShowBottomTab';

export const metadata: Metadata = {
  title: '온스쿼드 - 취미생활의 아지트',
  description: 'onsquad, 온스쿼드, 취미, 생활, 아지트, 등산, 게임',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <script
        async
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
      />
      <body className={cn('min-h-screen bg-background antialiased')}>
        <Providers>
          <Wrapper>
            <ShowBottomTab>{children}</ShowBottomTab>
          </Wrapper>
        </Providers>
      </body>
    </html>
  );
}
