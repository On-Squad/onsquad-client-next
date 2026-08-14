import { call, can } from '@onsquad/bridge/web';

import { captureError } from '@/shared/lib/observability';

/**
 * 계약 이전의 평문 신호.
 *
 * 스토어에 이미 깔린 앱은 이것만 알아듣는다. 웹은 배포하면 즉시 최신이지만 앱은 아니므로,
 * **지울 수 없다.** 새 계약을 지원하는 앱에만 새 경로를 태우고, 나머지는 여기로 떨어뜨린다.
 */
const LEGACY = {
  ready: 'APP_READY',
  backOn: 'NATIVE_BACK:on',
  backOff: 'NATIVE_BACK:off',
} as const;

const postLegacy = (message: string) => {
  window.ReactNativeWebView?.postMessage(message);
};

/**
 * 브릿지 호출 실패를 삼키되 흔적은 남긴다.
 * 셸 제어는 실패해도 사용자가 할 수 있는 일이 없어서 토스트를 띄우지 않는다.
 * 대신 어떤 메서드가 타임아웃 났는지는 남겨야 나중에 원인을 좁힐 수 있다.
 */
const reportAndIgnore = (error: unknown) => captureError(error);

/** 웹 준비 완료 — 네이티브 스플래시를 내린다. */
export const shellReady = () => {
  if (can('shell.ready')) {
    void call('shell.ready', undefined).catch(reportAndIgnore);

    return;
  }

  postLegacy(LEGACY.ready);
};

/** 이 화면이 iOS 엣지 스와이프 뒤로가기를 허용하는지 알린다. */
export const setBackGesture = (enabled: boolean) => {
  if (can('shell.setBackGesture')) {
    void call('shell.setBackGesture', { enabled }).catch(reportAndIgnore);

    return;
  }

  postLegacy(enabled ? LEGACY.backOn : LEGACY.backOff);
};
