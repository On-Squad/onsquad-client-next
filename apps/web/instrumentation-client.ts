import * as Sentry from '@sentry/nextjs';

import { getRuntimeContext, setSink } from '@/shared/lib/observability';
// index.ts 로 재노출하지 않는다 — 관측 모듈을 import 하는 모든 곳(테스트 포함)이 Sentry 를 끌고 오게 된다.
import { sentrySink } from '@/shared/lib/observability/sentrySink';

const isDev = process.env.NODE_ENV === 'development';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // 배포 식별자. 소스맵을 올릴 때 이 값으로 매칭된다.
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? (isDev ? 'development' : 'production'),
  tracesSampleRate: isDev ? 1.0 : 0.1,
  enableLogs: true,
  // DSN 이 없으면(로컬 기본값) 전송을 시도하지 않는다.
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
});

// 웹뷰 여부·앱버전·OS 를 모든 이벤트에 붙인다.
// 릴리즈 빌드 웹뷰는 재현이 안 되므로, 이 태그가 없으면 "누구에게서 난 버그인지"를 좁힐 수 없다.
// RN 이 콘텐츠 로드 전에 주입하므로 이 시점에 이미 읽을 수 있다.
Sentry.setTags({ ...getRuntimeContext() });

// DSN 이 없으면 콘솔 sink 로 남겨둔다 — 로컬에서 리포트가 조용히 사라지지 않게.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  setSink(sentrySink);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
