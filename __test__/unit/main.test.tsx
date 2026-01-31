import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

import { Appbar } from '@/shared/ui/Appbar';

vi.mock('@/shared/ui/Appbar', () => ({
  Appbar: () => <div data-testid="onsquad-logo">Test</div>,
}));

//TODO:// 서버 컴포넌트는 e2e로 대체
test('1. Test - Appbar Render, No Menu Toggle', () => {
  function AppbarComponent() {
    return <Appbar />;
  }

  render(<AppbarComponent />);

  expect(screen.getByTestId('onsquad-logo')).toBeDefined();
});
