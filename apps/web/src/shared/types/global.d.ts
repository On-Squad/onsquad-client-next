import type { AppInfo } from '@/shared/lib/observability';

declare global {
  interface Window {
    daum: any;
    /** react-native-webview 가 주입. 이 전역의 존재 여부가 웹뷰 판정 기준이다. */
    ReactNativeWebView?: { postMessage: (message: string) => void };
    /** RN 셸이 콘텐츠 로드 전에 주입하는 앱 정보. 브라우저에서는 undefined. */
    __ONSQUAD_APP__?: AppInfo;
  }
}

export {};
