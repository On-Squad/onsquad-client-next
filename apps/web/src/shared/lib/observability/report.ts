import { getRuntimeContext } from './appContext';
import { emit } from './sink';
import type { ErrorSource } from './types';

const toErrorFields = (error: unknown) => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  return { name: 'UnknownError', message: String(error), stack: undefined };
};

/** 잡은 에러를 수집처로 보낸다. try/catch 안에서 직접 호출한다. */
export const captureError = (error: unknown, source: ErrorSource = 'manual') => {
  emit({
    kind: 'error',
    ...toErrorFields(error),
    source,
    error,
    context: getRuntimeContext(),
    at: Date.now(),
  });
};

/**
 * 아무도 안 잡은 에러까지 수집한다.
 * 릴리즈 빌드 웹뷰는 원격 디버깅이 막혀 있어, 여기서 못 잡으면 볼 방법이 없다.
 *
 * @returns 해제 함수
 */
export const installGlobalErrorHandlers = () => {
  const onError = (event: ErrorEvent) => captureError(event.error ?? event.message, 'onerror');
  const onRejection = (event: PromiseRejectionEvent) => captureError(event.reason, 'unhandledrejection');

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
};
