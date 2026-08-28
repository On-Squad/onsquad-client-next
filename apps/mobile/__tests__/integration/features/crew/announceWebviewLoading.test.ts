import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useWebViewLoading } from '../../../../src/hooks/useWebViewLoading';

/**
 * 공지 웹뷰 화면(상세·작성·수정)이 로드되는 동안 흰 화면 대신 스켈레톤을 보여주는지 검증한다.
 *
 * RN 화면 컴포넌트를 직접 렌더하지 않는다 — RN 0.86 소스가 Flow 라 esbuild 가 파싱하지
 * 못한다(vitest.config.mts 참고). 대신 화면이 실제로 쓰는 훅을 React 렌더 안에서 돌리고,
 * WebView 가 부르는 것과 같은 콜백(onLoadStart/onLoad)과 웹이 보내는 준비 신호(onContentReady)로
 * 사용자가 겪는 순간을 재현한다.
 * `showSkeleton` 이 곧 화면에 스켈레톤이 덮여 있는지 여부다.
 */
describe('공지 웹뷰 로딩', () => {
  it('공지 화면으로 들어간 직후에는 흰 화면 대신 스켈레톤이 보인다', () => {
    const { result } = renderHook(() => useWebViewLoading());

    expect(result.current.showSkeleton).toBe(true);
  });

  it('문서만 내려온 시점에는 아직 스켈레톤이 덮여 있다', () => {
    // 여기서 걷으면 값 없는 껍데기가 먼저 보였다가 내용이 튀어 들어온다(실측).
    const { result } = renderHook(() => useWebViewLoading());

    act(() => result.current.onLoadStart());
    act(() => result.current.onLoad());

    expect(result.current.showSkeleton).toBe(true);
  });

  it('웹이 내용까지 그렸다고 알리면 스켈레톤이 사라지고 본문이 드러난다', () => {
    const { result } = renderHook(() => useWebViewLoading());

    act(() => result.current.onLoadStart());
    act(() => result.current.onLoad());
    act(() => result.current.onContentReady());

    expect(result.current.showSkeleton).toBe(false);
  });

  it('본문을 보던 중 웹뷰가 다음 문서를 불러오기 시작하면 스켈레톤이 다시 덮인다', () => {
    const { result } = renderHook(() => useWebViewLoading());

    act(() => result.current.onContentReady());
    expect(result.current.showSkeleton).toBe(false);

    act(() => result.current.onLoadStart());

    expect(result.current.showSkeleton).toBe(true);
  });

  it('화면마다 새 웹뷰를 띄우므로 다음 공지 화면도 스켈레톤부터 보인다', () => {
    const first = renderHook(() => useWebViewLoading());
    act(() => first.result.current.onContentReady());
    expect(first.result.current.showSkeleton).toBe(false);

    const next = renderHook(() => useWebViewLoading());

    expect(next.result.current.showSkeleton).toBe(true);
  });
});
