import * as Sentry from '@sentry/nextjs';

const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  environment: process.env.VERCEL_ENV ?? (isDev ? 'development' : 'production'),
  tracesSampleRate: isDev ? 1.0 : 0.1,
  enableLogs: true,
  enabled: Boolean(process.env.SENTRY_DSN),
});
