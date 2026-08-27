import { useCallback, useReducer } from 'react';

import { WEBVIEW_LOADING_INITIAL, webViewLoadingReducer } from '../shared/lib/webViewLoadState';

/**
 * 웹뷰가 준비될 때까지 스켈레톤을 보여주는 상태.
 *
 * 초기값이 true 라 화면이 전환되는 즉시 스켈레톤이 그려진다 — 웹뷰가 첫 프레임을
 * 그리기 전의 흰 화면을 사용자가 보지 않는다.
 * 반환한 `onLoadStart`/`onLoad` 는 WebView 의 같은 이름 prop 에 그대로 연결한다.
 */
export function useWebViewLoading() {
  const [showSkeleton, dispatchLoadEvent] = useReducer(webViewLoadingReducer, WEBVIEW_LOADING_INITIAL);

  const onLoadStart = useCallback(() => dispatchLoadEvent('start'), []);
  const onLoad = useCallback(() => dispatchLoadEvent('end'), []);

  return { showSkeleton, onLoadStart, onLoad };
}
