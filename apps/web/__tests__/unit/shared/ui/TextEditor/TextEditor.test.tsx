import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

// next/dynamic 을 스텁 처리해 CodeMirror·ReactMarkdown 의 비동기 로드를 피한다.
vi.mock('next/dynamic', () => ({
  default: () => () => null,
}));

// 브릿지 can / pickImage 를 제어한다.
vi.mock('@/shared/lib/bridge', () => ({
  can: vi.fn(),
  pickImage: vi.fn(),
}));

// supabase 는 브라우저 경로에서만 쓴다 — 브릿지 경로 테스트에서는 사용되지 않는다.
vi.mock('@/shared/lib/supabse/createClient', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: '' } })),
      })),
    },
  },
}));

import { can, pickImage } from '@/shared/lib/bridge';

import TextEditor from '@/shared/ui/TextEditor/TextEditor';

// jsdom 은 ResizeObserver 를 제공하지 않는다 — 스텁으로 채운다.
beforeEach(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TextEditor 이미지 버튼 (웹뷰)', () => {
  it('웹뷰에서 이미지 버튼을 누르면 브릿지가 돌려준 더미 URI 가 본문에 삽입된다', async () => {
    vi.mocked(can).mockReturnValue(true);
    vi.mocked(pickImage).mockResolvedValue(['https://via.placeholder.com/300']);

    const onChange = vi.fn();
    render(<TextEditor onChange={onChange} />);

    const imageButton = screen.getByRole('button', { name: '이미지 추가' });
    fireEvent.click(imageButton);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        '\n![이미지](https://via.placeholder.com/300)\n',
      );
    });
  });

  it('웹뷰에서 이미지 버튼을 누르면 파일 인풋이 아니라 브릿지 pickImage 가 호출된다', async () => {
    vi.mocked(can).mockReturnValue(true);
    vi.mocked(pickImage).mockResolvedValue(['https://via.placeholder.com/300']);

    render(<TextEditor />);

    const imageButton = screen.getByRole('button', { name: '이미지 추가' });
    fireEvent.click(imageButton);

    await waitFor(() => {
      expect(pickImage).toHaveBeenCalledWith(1);
    });

    expect(document.querySelector('input[type="file"]')).toBeNull();
  });
});

describe('TextEditor 이미지 버튼 (브라우저)', () => {
  it('브라우저에서는 파일 인풋이 렌더링되고 브릿지 버튼은 렌더링되지 않는다', () => {
    vi.mocked(can).mockReturnValue(false);

    render(<TextEditor />);

    expect(document.querySelector('input[type="file"][accept="image/*"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: '이미지 추가' })).toBeNull();
  });
});
