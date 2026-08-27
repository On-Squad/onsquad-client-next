import { afterEach, describe, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';

import { CrewDetailAppbar } from '@/features/crew/detail/ui/CrewDetailAppbar';

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { data: { name: '불꽃크루' } } }),
}));

vi.mock('@/entities/crew', () => ({
  crewQueries: { detail: () => ({ queryKey: ['crew', 'detail', 7] }) },
}));

const enterAppWebView = () => {
  window.ReactNativeWebView = { postMessage: () => {} };
};

afterEach(() => {
  delete window.ReactNativeWebView;
  cleanup();
});

/**
 * 공지 상세는 앱에서 웹뷰로 뜬다. RN 이 이미 "공지사항" 헤더를 그리므로
 * 웹까지 앱바를 그리면 사용자에게 헤더가 **두 개** 보인다.
 */
describe('크루 화면 상단 헤더', () => {
  it('브라우저에서는 크루명을 단 웹 앱바가 보인다', () => {
    render(<CrewDetailAppbar crewId={7} />);

    expect(screen.getByText('불꽃크루')).toBeDefined();
  });

  it('앱 웹뷰에서는 웹 앱바가 보이지 않는다 — 네이티브 헤더가 이미 있다', () => {
    enterAppWebView();

    render(<CrewDetailAppbar crewId={7} />);

    expect(screen.queryByText('불꽃크루')).toBeNull();
  });
});
