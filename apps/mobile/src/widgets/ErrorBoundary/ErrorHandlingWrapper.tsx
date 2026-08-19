import { type ComponentType, type ReactNode, Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';

import type { FallbackProps } from '../../shared/types/error';
import ErrorBoundary from './ErrorBoundary';

interface ErrorHandlingWrapperProps {
  children: ReactNode;
  fallbackComponent: ComponentType<FallbackProps>;
  suspenseFallback: ReactNode;
}

/**
 * 웹 `widgets/ErrorBoundary/ErrorHandlingWrapper` 의 RN 미러.
 *
 * 세 겹이 각각 다른 일을 한다.
 *   `QueryErrorResetBoundary` — 폴백의 "다시 시도" 가 쿼리 에러 상태까지 함께 풀어준다
 *   `ErrorBoundary`           — 렌더 중 던져진 에러를 잡아 폴백으로 바꾼다
 *   `Suspense`                — `useSuspenseQuery` 의 대기 상태를 받는다
 *
 * 이걸 쓰면 화면이 `isPending` · `isError` 를 **직접 분기하지 않는다.**
 * 화면은 "데이터가 있다" 는 전제로만 쓰이고, 없거나 실패한 경우는 경계가 맡는다.
 */
export function ErrorHandlingWrapper({
  children,
  fallbackComponent: FallbackComponent,
  suspenseFallback,
}: ErrorHandlingWrapperProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={FallbackComponent}>
          <Suspense fallback={suspenseFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
