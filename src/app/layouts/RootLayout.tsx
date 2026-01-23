import React from 'react';

import type { Metadata, Viewport } from 'next';

import Script from 'next/script';

import Providers from '@/services/providers';
import { cn } from '@/shared/lib/utils';
import { Toaster } from '@/shared/ui/ui/toaster';
import '@/app/styles/globals.css';
import 'quill/dist/quill.core.css';

import { Wrapper } from '@/shared/ui/Wrapper';
import { ShowBottomTab } from '@/shared/ui/ShowBottomTab';
import { Modal } from '@/shared/ui/Modal';

import { SessionProvider } from '@/providers/SessionProvider';

import { ErrorHandlingWrapper } from '@/widgets/ErrorBoundary';
import { ErrorFallback } from '@/widgets/ErrorFallback';
import { Spinner } from '@/shared/ui/Spinner';

export const metadata: Metadata = {
  title: '온스쿼드 - 취미생활의 아지트',
  description: 'onsquad, 온스쿼드, 취미, 생활, 아지트, 등산, 게임',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head></head>

      <Script
        strategy="lazyOnload"
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
      />
      <body className={cn('bg-background antialiased')}>
        <SessionProvider>
          <ErrorHandlingWrapper
            fallbackComponent={ErrorFallback}
            suspenseFallback={<Spinner />}
          >
            <Providers>
              <Wrapper>
                <ShowBottomTab>{children}</ShowBottomTab>
              </Wrapper>
            </Providers>
          </ErrorHandlingWrapper>
          <Toaster />
          <Modal />
        </SessionProvider>
      </body>
    </html>
  );
}
