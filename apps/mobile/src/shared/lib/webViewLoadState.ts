export type WebViewLoadEvent = 'start' | 'end';

/**
 * 웹뷰 로딩 상태 전환 함수.
 *
 * 초기값 true — 화면이 전환되는 즉시 스켈레톤이 보여야 한다.
 * onLoadStart → true, onLoad(end) → false.
 */
export function webViewLoadingReducer(_: boolean, event: WebViewLoadEvent): boolean {
  return event === 'start';
}

export const WEBVIEW_LOADING_INITIAL = true;
