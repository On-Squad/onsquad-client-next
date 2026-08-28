import { afterEach, describe, expect, it } from 'vitest';

import { getProvidedAccessToken, setAccessTokenProvider } from '@/shared/api/accessTokenProvider';

afterEach(() => {
  setAccessTokenProvider(() => undefined);
});

describe('요청에 실을 토큰을 꺼낼 때', () => {
  it('토큰을 아직 받아오는 중이어도 다 받은 뒤의 값을 준다', async () => {
    let grant: (token: string) => void = () => {};
    const pending = new Promise<string>((resolve) => {
      grant = resolve;
    });

    // 웹뷰가 브릿지로 토큰을 요청해 둔 상태 — 아직 응답이 오지 않았다.
    setAccessTokenProvider(() => pending);

    const reading = getProvidedAccessToken();
    grant('shell-token');

    await expect(reading).resolves.toBe('shell-token');
  });

  it('토큰을 못 받아오면 토큰 없이 요청하게 둔다', async () => {
    setAccessTokenProvider(() => Promise.reject(new Error('브릿지 응답 없음')));

    await expect(getProvidedAccessToken()).resolves.toBeUndefined();
  });

  it('등록된 provider 가 없으면 토큰 없이 요청하게 둔다', async () => {
    await expect(getProvidedAccessToken()).resolves.toBeUndefined();
  });
});
