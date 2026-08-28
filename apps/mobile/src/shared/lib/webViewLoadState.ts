/**
 * 웹뷰 스켈레톤을 언제 내릴지 정하는 상태.
 *
 * **`documentLoaded` 로는 내리지 않는다.** WebView 의 `onLoad` 는 HTML 이 내려왔다는
 * 뜻일 뿐이라, 그때 내리면 데이터 없는 껍데기(빈 제목·"작성된 내용이 없습니다")가
 * 먼저 보였다가 내용이 툭 튀어 들어온다(실측).
 *
 * 웹이 **내용까지 그린 뒤** 보내는 `contentReady` 를 기다린다.
 * 웹이 그걸 못 보내는 경우(구버전 웹·에러 화면)를 위해 `timeout` 안전망을 둔다 —
 * 신호만 믿으면 스켈레톤이 영원히 남는다.
 */
export type WebViewLoadEvent = 'start' | 'documentLoaded' | 'contentReady' | 'timeout';

export function webViewLoadingReducer(isLoading: boolean, event: WebViewLoadEvent): boolean {
  switch (event) {
    case 'start':
      return true;
    case 'documentLoaded':
      return isLoading;
    case 'contentReady':
    case 'timeout':
      return false;
  }
}

export const WEBVIEW_LOADING_INITIAL = true;

/**
 * 웹이 `contentReady` 를 못 보낼 때 스켈레톤을 걷어내는 한계.
 * 에뮬레이터에서 웹 첫 로드가 10초를 넘는 경우가 있어 넉넉히 잡는다.
 */
export const WEBVIEW_READY_TIMEOUT_MS = 15_000;
