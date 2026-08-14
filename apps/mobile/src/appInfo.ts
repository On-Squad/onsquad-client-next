import { BRIDGE_VERSION, type AppInfo } from '@onsquad/bridge';
import { SUPPORTED_METHODS, buildAppInfoScript } from '@onsquad/bridge/native';
import { Platform } from 'react-native';

import { version as appVersion } from '../package.json';

/**
 * JS 번들이 평가된 시각 = 사실상 앱이 켜진 시각.
 * 지금은 웹뷰가 하나뿐이라 "사용자가 탭한 순간"과 같다.
 * 탭/스택이 네이티브로 올라가면 각 화면의 실제 탭 시각으로 바뀐다.
 */
export const APP_LAUNCHED_AT = Date.now();

/**
 * WebView 의 `injectedJavaScriptBeforeContentLoaded` 에 넣을 스크립트를 만든다.
 * 콘텐츠 로드 **전에** 실행되어야 웹의 첫 렌더부터 `can()` 과 환경 태깅이 동작한다.
 *
 * RN 과 WebView 는 같은 기기 시계를 쓰므로, 여기서 넣은 epoch ms 를
 * 웹이 `Date.now()`/`performance.timeOrigin` 과 직접 빼서 구간을 계산할 수 있다.
 */
export const buildAppInfo = (webviewCreatedAt: number): string => {
  const info: AppInfo = {
    bridgeVersion: BRIDGE_VERSION,
    appVersion,
    os: Platform.OS === 'ios' ? 'ios' : 'android',
    // 이 빌드가 실제로 처리하는 메서드만 알린다. 웹은 이걸 보고 fallback 여부를 정한다.
    methods: SUPPORTED_METHODS,
    tapAt: APP_LAUNCHED_AT,
    webviewCreatedAt,
  };

  return buildAppInfoScript(info);
};
