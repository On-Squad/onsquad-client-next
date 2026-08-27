import { afterEach, describe, expect, it, vi } from 'vitest';

// media.ts 의 계약은 "can() 결과에 따라 bridge 호출 vs 빈 배열 반환" 이다.
// call/can 자체의 postMessage·타임아웃 동작은 web.test.ts 에서 이미 실물로 검증하므로,
// 여기서는 그 경계를 mock 해 pickImage 분기 자체만 본다.
vi.mock('@onsquad/bridge/web', () => ({
  call: vi.fn(),
}));

vi.mock('@/shared/lib/observability', () => ({
  captureError: vi.fn(),
}));

import { call } from '@onsquad/bridge/web';
import { captureError } from '@/shared/lib/observability';

import { pickImage } from '@/shared/lib/bridge/media';

afterEach(() => {
  vi.clearAllMocks();
});

describe('pickImage', () => {
  it('브릿지가 URI 목록을 반환하면 그 목록을 돌려준다', async () => {
    const DUMMY_URIS = ['https://via.placeholder.com/300'];
    vi.mocked(call).mockResolvedValue({ uris: DUMMY_URIS });

    const result = await pickImage(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe('https://via.placeholder.com/300');
  });

  it('브릿지가 여러 URI 를 반환하면 전부 돌려준다', async () => {
    const DUMMY_URIS = ['https://via.placeholder.com/300', 'https://via.placeholder.com/400'];
    vi.mocked(call).mockResolvedValue({ uris: DUMMY_URIS });

    const result = await pickImage(2);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe('https://via.placeholder.com/300');
    expect(result[1]).toBe('https://via.placeholder.com/400');
  });

  it('브릿지 호출이 실패하면 빈 배열을 반환한다', async () => {
    vi.mocked(call).mockRejectedValue(new Error('TIMEOUT'));

    const result = await pickImage(1);

    expect(result).toHaveLength(0);
  });

  it('브릿지 호출이 실패하면 오류를 captureError 로 기록한다', async () => {
    const error = new Error('PERMISSION_DENIED');
    vi.mocked(call).mockRejectedValue(error);

    await pickImage(1);

    expect(captureError).toHaveBeenCalledWith(error);
  });

  it('max 값을 media.pickImage 요청에 그대로 전달한다', async () => {
    vi.mocked(call).mockResolvedValue({ uris: [] });

    await pickImage(3);

    expect(call).toHaveBeenCalledWith('media.pickImage', { max: 3 });
  });
});
