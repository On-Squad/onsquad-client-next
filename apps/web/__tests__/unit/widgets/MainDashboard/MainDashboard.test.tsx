import { afterEach, describe, expect, it, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';

import MainDashboard from '@/widgets/MainDashboard/MainDashboard';

afterEach(() => cleanup());

vi.mock('@/shared/ui/Article', () => ({
  Article: ({ slot }: { slot: React.ReactNode }) => <div data-testid="article">{slot}</div>,
}));

vi.mock('@/shared/ui/Text', () => ({
  Text: {
    lg: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <span className={className}>{children}</span>
    ),
    base: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <span className={className}>{children}</span>
    ),
  },
}));

describe('MainDashboard', () => {
  it('"크루에 합류하기" heading이 렌더링된다', () => {
    render(<MainDashboard />);

    expect(screen.getByRole('heading', { name: '크루에 합류하기' })).toBeDefined();
  });

  it('크루 개설을 안내하는 문구가 렌더링된다', () => {
    render(<MainDashboard />);

    expect(screen.getByText('크루를 개설하고 크루원을 모집하세요.')).toBeDefined();
  });
});
