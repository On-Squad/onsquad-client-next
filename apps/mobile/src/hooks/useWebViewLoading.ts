import { useCallback, useEffect, useReducer } from 'react';

import {
  WEBVIEW_LOADING_INITIAL,
  WEBVIEW_READY_TIMEOUT_MS,
  webViewLoadingReducer,
} from '../shared/lib/webViewLoadState';

/**
 * 웹뷰가 **내용까지** 준비될 때까지 스켈레톤을 보여주는 상태.
 *
 * 초기값이 true 라 화면이 전환되는 즉시 스켈레톤이 그려진다.
 * `onLoad`(문서 로드)로는 내리지 않는다 — 그때 내리면 값 없는 껍데기가 먼저 보인다.
 * 웹이 `shell.contentReady` 를 보내면 내린다.
 *
 * 웹이 그걸 못 보내는 경우(구버전 웹·에러 화면)에 대비해 안전망 타임아웃을 둔다.
 * 신호만 믿으면 스켈레톤이 영원히 남는다.
 */
export function useWebViewLoading() {
  const [showSkeleton, dispatchLoadEvent] = useReducer(webViewLoadingReducer, WEBVIEW_LOADING_INITIAL);

  const onLoadStart = useCallback(() => dispatchLoadEvent('start'), []);
  const onLoad = useCallback(() => dispatchLoadEvent('documentLoaded'), []);
  const onContentReady = useCallback(() => dispatchLoadEvent('contentReady'), []);

  useEffect(() => {
    if (!showSkeleton) return;

    const timer = setTimeout(() => dispatchLoadEvent('timeout'), WEBVIEW_READY_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [showSkeleton]);

  return { showSkeleton, onLoadStart, onLoad, onContentReady };
}
