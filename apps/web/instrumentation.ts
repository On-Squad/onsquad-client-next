import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/** 서버에서 아무도 안 잡은 요청 에러를 수집한다. BFF 라우트(`app/api/bff`) 실패가 여기로 온다. */
export const onRequestError = Sentry.captureRequestError;
