import { Platform } from 'react-native';

import { version as appVersion } from '../package.json';

/**
 * 웹에 주입하는 앱 정보의 계약 버전.
 *
 * 스토어에 깔린 구버전 앱은 업데이트되지 않으므로 이 페이로드는 **필드 추가만** 한다.
 * 삭제하거나 의미를 바꾸면 구버전 앱을 보고 있는 사용자에게서 조용히 깨진다.
 */
export const BRIDGE_VERSION = 1;

/**
 * JS 번들이 평가된 시각 = 사실상 앱이 켜진 시각.
 * 지금은 웹뷰가 하나뿐이라 "사용자가 탭한 순간"과 같다.
 * 탭/스택이 네이티브로 올라가면 각 화면의 실제 탭 시각으로 바뀐다.
 */
export const APP_LAUNCHED_AT = Date.now();

/** 웹의 `AppInfo`(apps/web/src/shared/lib/observability/types.ts)와 같은 모양이어야 한다. */
interface AppInfo {
  bridgeVersion: number;
  appVersion: string;
  os: 'ios' | 'android';
  tapAt: number;
  webviewCreatedAt: number;
}

/**
 * WebView 의 `injectedJavaScriptBeforeContentLoaded` 에 넣을 스크립트를 만든다.
 * 콘텐츠 로드 **전에** 실행되어야 웹의 첫 렌더부터 앱 정보를 쓸 수 있다.
 *
 * RN 과 WebView 는 같은 기기 시계를 쓰므로, 여기서 넣은 epoch ms 를
 * 웹이 `Date.now()`/`performance.timeOrigin` 과 직접 빼서 구간을 계산할 수 있다.
 */
export const buildAppInfoScript = (webviewCreatedAt: number): string => {
  const info: AppInfo = {
    bridgeVersion: BRIDGE_VERSION,
    appVersion,
    os: Platform.OS === 'ios' ? 'ios' : 'android',
    tapAt: APP_LAUNCHED_AT,
    webviewCreatedAt,
  };

  // 끝의 `true;` 는 iOS 에서 반환값 관련 경고를 막기 위한 관용구다.
  return `window.__ONSQUAD_APP__ = ${JSON.stringify(info)}; true;`;
};
