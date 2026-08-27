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

  it('웹이 준비되면 스켈레톤이 사라진다', () => {
    const isLoading = webViewLoadingReducer(true, 'end');

    expect(isLoading).toBe(false);
  });

  it('새 URL 로 이동하면 스켈레톤이 다시 나타난다', () => {
    const isLoading = webViewLoadingReducer(false, 'start');

    expect(isLoading).toBe(true);
  });
});
