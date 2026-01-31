// vitest.setup.tsx - 전체 파일
import { HTMLAttributes } from 'react';

import { vi } from 'vitest';

vi.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: class {
    static json() {
      return {};
    }
  },
  cookies: () => ({
    get: () => undefined,
    set: () => {},
  }),
  headers: () => ({
    get: () => null,
  }),
}));

// Next.js navigation mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useSelectedLayoutSegments: () => [],
}));

// next-auth mock
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Next.js Image mock
vi.mock('next/image', () => ({
  default: (props: HTMLAttributes<HTMLImageElement>) => {
    return <img {...props} />;
  },
}));
