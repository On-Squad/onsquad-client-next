'use client';

import { useEffect } from 'react';

import * as Sentry from '@sentry/nextjs';

import { ErrorFallback } from './ErrorFallback';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 루트 레이아웃까지 깨졌을 때의 최후 경계.
 * 이 경계가 뜨면 RootLayout 이 통째로 대체되므로 Provider 가 전부 죽는다 —
 * 즉 우리 전역 에러 핸들러도 없다. 그래서 여기서는 Sentry 로 직접 보낸다.
 * `<html>`/`<body>` 를 직접 그려야 하는 것도 같은 이유다.
 */
export function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <ErrorFallback error={error} resetErrorBoundary={reset} />
      </body>
    </html>
  );
}
