import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TOAST } from '@/shared/config/toast';
import { useToast } from '@/shared/lib/hooks/useToast';

const libToast = vi.hoisted(() => vi.fn());
const bridgeToast = vi.hoisted(() => vi.fn());
const can = vi.hoisted(() => vi.fn());

vi.mock('@/shared/ui/ui/use-toast', () => ({
  useToast: () => ({ toast: libToast, dismiss: vi.fn() }),
}));

vi.mock('@/shared/lib/bridge', () => ({
  can,
  shellToast: bridgeToast,
}));

afterEach(() => {
  libToast.mockClear();
  bridgeToast.mockClear();
  can.mockReset();
});

describe('토스트를 띄울 때', () => {
  it('웹뷰에서는 셸이 띄우도록 문구를 넘긴다', () => {
    // 웹이 자기 토스트를 그리면 앱의 다른 화면과 생김새가 갈린다.
    can.mockReturnValue(true);

    const { result } = renderHook(() => useToast());

    result.current.toast({ title: '상단에 고정했어요', className: TOAST.success });

    expect(bridgeToast).toHaveBeenCalledWith('상단에 고정했어요');
    expect(libToast).not.toHaveBeenCalled();
  });

  it('브라우저에서는 지금까지처럼 웹 토스트가 뜬다', () => {
    can.mockReturnValue(false);

    const { result } = renderHook(() => useToast());

    result.current.toast({ title: '저장했어요', className: TOAST.success });

    expect(libToast).toHaveBeenCalledWith(expect.objectContaining({ title: '저장했어요' }));
    expect(bridgeToast).not.toHaveBeenCalled();
  });
});
