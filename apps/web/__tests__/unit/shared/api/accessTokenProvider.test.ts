import { beforeEach, describe, expect, it, vi } from 'vitest';

// accessTokenProvider.ts 의 등록 함수는 모듈 스코프 상태라 케이스 순서가 결과에 영향을 준다.
// 매 케이스마다 모듈을 새로 로드해 상태를 초기화한다.
beforeEach(() => {
  vi.resetModules();
});

describe('getProvidedAccessToken', () => {
  it('셸이 등록한 토큰이 그대로 조회된다', async () => {
    const { setAccessTokenProvider, getProvidedAccessToken } = await import('@/shared/api/accessTokenProvider');
    setAccessTokenProvider(() => 'shell-issued-token');

    expect(getProvidedAccessToken()).toBe('shell-issued-token');
  });

  it('아무도 토큰을 등록하지 않았으면 토큰 없이 요청한다', async () => {
    const { getProvidedAccessToken } = await import('@/shared/api/accessTokenProvider');

    expect(getProvidedAccessToken()).toBeUndefined();
  });

  it('토큰을 꺼내다 예외가 나도 요청 자체는 막히지 않는다', async () => {
    const { setAccessTokenProvider, getProvidedAccessToken } = await import('@/shared/api/accessTokenProvider');
    setAccessTokenProvider(() => {
      throw new Error('provider 내부 오류');
    });

    expect(() => getProvidedAccessToken()).not.toThrow();
    expect(getProvidedAccessToken()).toBeUndefined();
  });
});
