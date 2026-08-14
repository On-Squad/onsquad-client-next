import type { AppInfo, RuntimeContext } from './types';

/** Vercel 이 Next 빌드에 자동 노출하는 커밋 SHA. 로컬에서는 없다. */
const WEB_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev';

/**
 * RN 셸이 주입한 앱 정보를 읽는다. 브라우저에서는 undefined.
 * 주입 실패(구버전 앱)도 정상 경로로 취급한다 — 웹은 앱 없이도 동작해야 한다.
 */
export const getAppInfo = (): AppInfo | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.__ONSQUAD_APP__;
};

/**
 * 웹뷰 판정은 UA 가 아니라 `ReactNativeWebView` 주입 여부로 한다.
 * UA 는 앱 설정에 따라 바뀌지만 이 전역은 react-native-webview 가 항상 넣어준다.
 */
export const getIsWebView = (): boolean => typeof window !== 'undefined' && Boolean(window.ReactNativeWebView);

/** 모든 리포트에 붙일 환경 태그를 만든다. */
export const getRuntimeContext = (): RuntimeContext => {
  const app = getAppInfo();
  const isWebView = getIsWebView();

  return {
    isWebView,
    os: app?.os ?? 'web',
    appVersion: app?.appVersion ?? null,
    bridgeVersion: app?.bridgeVersion ?? null,
    webVersion: WEB_VERSION,
  };
};
