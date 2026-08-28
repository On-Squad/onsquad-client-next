import { describe, expect, it } from 'vitest';

import { WEBVIEW_LOADING_INITIAL, webViewLoadingReducer } from '../../../src/shared/lib/webViewLoadState';

/**
 * 웹뷰 스켈레톤 표시 상태 단위 테스트.
 *
 * RN 컴포넌트를 import 하지 않는다(Flow 파서 제약).
 * 스켈레톤을 언제 보이고 감추는지의 상태 논리만 검증한다.
 */
describe('웹뷰 스켈레톤', () => {
  it('공지 화면으로 이동하면 스켈레톤이 먼저 보인다', () => {
    expect(WEBVIEW_LOADING_INITIAL).toBe(true);
  });

  it('문서만 로드된 시점에는 스켈레톤이 그대로 있다', () => {
    // onLoad 는 HTML 이 내려왔다는 뜻일 뿐이다. 이때 스켈레톤을 내리면
    // 데이터 없는 껍데기가 먼저 보였다가 내용이 튀어 들어온다(실측).
    const isLoading = webViewLoadingReducer(true, 'documentLoaded');

    expect(isLoading).toBe(true);
  });

  it('웹이 내용까지 그렸다고 알리면 스켈레톤이 사라진다', () => {
    const isLoading = webViewLoadingReducer(true, 'contentReady');

    expect(isLoading).toBe(false);
  });

  it('웹이 알려주지 못해도 안전망이 돌면 스켈레톤이 사라진다', () => {
    const isLoading = webViewLoadingReducer(true, 'timeout');

    expect(isLoading).toBe(false);
  });

  it('새 URL 로 이동하면 스켈레톤이 다시 나타난다', () => {
    const isLoading = webViewLoadingReducer(false, 'start');

    expect(isLoading).toBe(true);
  });
});
