import { renderHook } from '@testing-library/react';
import { useTransitionRouter } from 'next-view-transitions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { can } from '@onsquad/bridge/web';
import { shellPush, shellReplace } from '@/shared/lib/bridge/shell';
import { usePageMove } from '@/shared/lib/hooks/usePageMove';

vi.mock('next-view-transitions', () => ({
  useTransitionRouter: vi.fn(),
}));

// shell.push / shell.replace 를 스파이로 교체해 브릿지 호출을 추적한다.
// can() 은 @onsquad/bridge/web 에서 오므로 같이 mock 해야 한다.
vi.mock('@onsquad/bridge/web', () => ({
  can: vi.fn().mockReturnValue(false),
}));

vi.mock('@/shared/lib/bridge/shell', () => ({
  shellPush: vi.fn(),
  shellReplace: vi.fn(),
}));

describe('usePageMove', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    vi.mocked(useTransitionRouter).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  afterEach(() => {
    delete document.documentElement.dataset.vtDirection;
  });

  it('handlePageMove를 반환한다', () => {
    const { result } = renderHook(() => usePageMove());
    expect(typeof result.current.handlePageMove).toBe('function');
  });

  it('handlePageMove 호출 시 push가 지정 경로/scroll:false로 호출된다', () => {
    const { result } = renderHook(() => usePageMove());
    result.current.handlePageMove('/crews/1');
    expect(mockPush).toHaveBeenCalledWith('/crews/1', { scroll: false });
  });

  it('scroll 옵션을 명시하면 그 값이 전달된다', () => {
    const { result } = renderHook(() => usePageMove());
    result.current.handlePageMove('/home', { scroll: true });
    expect(mockPush).toHaveBeenCalledWith('/home', { scroll: true });
  });

  it('handlePageMove 호출 시 방향이 forward로 태깅된다', () => {
    const { result } = renderHook(() => usePageMove());
    result.current.handlePageMove('/crews/1');
    expect(document.documentElement.dataset.vtDirection).toBe('forward');
  });

  it('handleReplace 호출 시 replace가 지정 경로/scroll:false로 호출된다', () => {
    const { result } = renderHook(() => usePageMove());
    result.current.handleReplace('/crews/1');
    expect(mockReplace).toHaveBeenCalledWith('/crews/1', { scroll: false });
  });

  it('handleReplace 호출 시 방향이 forward로 태깅된다', () => {
    const { result } = renderHook(() => usePageMove());
    result.current.handleReplace('/crews/1');
    expect(document.documentElement.dataset.vtDirection).toBe('forward');
  });
});

describe('usePageMove — 앱 웹뷰에서 브릿지로 라우팅', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    vi.mocked(shellPush).mockClear();
    vi.mocked(shellReplace).mockClear();
    vi.mocked(useTransitionRouter).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  afterEach(() => {
    delete document.documentElement.dataset.vtDirection;
    vi.mocked(can).mockReturnValue(false);
  });

  it('앱 웹뷰에서 handlePageMove 를 호출하면 브릿지로 경로를 전달하고 라우터는 호출하지 않는다', () => {
    vi.mocked(can).mockReturnValue(true);

    const { result } = renderHook(() => usePageMove());
    result.current.handlePageMove('/crews/1/announce/5');

    expect(shellPush).toHaveBeenCalledWith('/crews/1/announce/5');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('앱 웹뷰에서 handleReplace 를 호출하면 브릿지로 경로를 전달하고 라우터는 호출하지 않는다', () => {
    vi.mocked(can).mockReturnValue(true);

    const { result } = renderHook(() => usePageMove());
    result.current.handleReplace('/crews/1/announce');

    expect(shellReplace).toHaveBeenCalledWith('/crews/1/announce');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('브라우저에서 handlePageMove 를 호출하면 라우터를 쓰고 브릿지는 호출하지 않는다', () => {
    vi.mocked(can).mockReturnValue(false);

    const { result } = renderHook(() => usePageMove());
    result.current.handlePageMove('/crews/1/announce/5');

    expect(mockPush).toHaveBeenCalledWith('/crews/1/announce/5', { scroll: false });
    expect(shellPush).not.toHaveBeenCalled();
  });

  it('브라우저에서 handleReplace 를 호출하면 라우터를 쓰고 브릿지는 호출하지 않는다', () => {
    vi.mocked(can).mockReturnValue(false);

    const { result } = renderHook(() => usePageMove());
    result.current.handleReplace('/crews/1/announce');

    expect(mockReplace).toHaveBeenCalledWith('/crews/1/announce', { scroll: false });
    expect(shellReplace).not.toHaveBeenCalled();
  });
});
