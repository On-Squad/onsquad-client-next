/**
 * 회귀 테스트: 만료 응답 → 세션 갱신 → 원요청 재시도 계약
 *
 * 배경:
 * - shared/api/common.ts 는 인증 인스턴스가 토큰 만료(T003/401) 응답을 받으면
 *   refreshSession() 을 1회 부르고, 갱신에 성공하면 원요청을 재시도한다.
 * - 기존에는 이 분기에 getIsBrowserRuntime() 게이트가 있었다. 그런데 그 플래그는
 *   BFF 경유 여부(같은 파일 75행)도 결정한다. React Native 는 BFF 가 없어 그쪽에서 false 여야
 *   하는데 갱신 재시도는 필요하므로, 플래그 하나로 두 요구를 동시에 만족시킬 수 없었다.
 * - refreshSession() 은 등록된 갱신 함수가 없으면 false 를 반환하므로 레지스트리 자체가 게이트다.
 *   (서버 렌더링에서는 session-provider 가 'use client' 라 등록될 경로가 없다)
 *
 * 이 테스트가 잠그는 것:
 *   1. 갱신 함수가 등록돼 있으면 브라우저가 아닌 런타임에서도 원요청을 재시도한다
 *   2. 등록돼 있지 않으면 재시도하지 않고 만료 응답을 그대로 흘려보낸다
 *
 * 런타임 전략:
 * - setBrowserRuntime(false) 로 React Native 상황을 재현한다. 이렇게 해야
 *   apiFetch 가 BFF(clientBaseUrl) 대신 절대 baseUrl 을 쓰고, 옛 게이트가 실제로 막는 것을
 *   확인할 수 있다. jsdom 은 document 가 있어 기본 판정이 true 라 이 명시가 없으면
 *   테스트가 게이트를 잠그지 못한다.
 */
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { server } from '../../setup/msw/server';

const TEST_API_BASE_URL = 'https://api.test.example';

/**
 * 한 핸들러가 만료 응답과 성공 응답을 번갈아 내므로 두 모양을 함께 담는 타입이 필요하다.
 * 백엔드 봉투도 실제로 이 형태다 — 성공이면 data, 실패면 error 가 채워진다.
 */
interface MeResponseBody {
  status: number;
  success: boolean;
  error?: { code: string; message: string };
  data?: { nickname: string };
}

const expiredBody: MeResponseBody = {
  status: 401,
  success: false,
  error: { code: 'T003', message: '토큰이 만료되었습니다.' },
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('토큰 만료 시 갱신 후 재시도', () => {
  it('갱신 함수가 등록돼 있으면 브라우저가 아니어도 원요청을 다시 보낸다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { apiFetch } = await import('@/shared/api/common');
    const { setBrowserRuntime } = await import('@/shared/api/runtime');
    const { registerSessionRefresh } = await import('@/shared/lib/auth/sessionRefresh');

    // React Native 런타임을 재현한다 — BFF 를 타지 않고 절대 baseUrl 로 나간다.
    setBrowserRuntime(false);

    let attempts = 0;

    server.use(
      http.get<never, never, MeResponseBody>(`${TEST_API_BASE_URL}/api/me`, () => {
        attempts += 1;

        // 첫 요청은 만료, 갱신 뒤의 두 번째 요청은 성공.
        if (attempts === 1) {
          return HttpResponse.json(expiredBody);
        }

        return HttpResponse.json({ status: 200, success: true, data: { nickname: '닉네임1' } });
      }),
    );

    let refreshCallCount = 0;

    registerSessionRefresh(async () => {
      refreshCallCount += 1;

      return true;
    });

    const response = await apiFetch.get<MeResponseBody>('/me');

    expect(attempts).toBe(2);
    expect(refreshCallCount).toBe(1);
    expect(response.data.data?.nickname).toBe('닉네임1');
  });

  it('갱신 함수가 없으면 재시도하지 않고 만료 응답을 흘려보낸다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { apiFetch } = await import('@/shared/api/common');
    const { setBrowserRuntime } = await import('@/shared/api/runtime');

    setBrowserRuntime(false);

    let attempts = 0;

    server.use(
      http.get<never, never, MeResponseBody>(`${TEST_API_BASE_URL}/api/me`, () => {
        attempts += 1;

        return HttpResponse.json(expiredBody);
      }),
    );

    // 백엔드는 만료도 HTTP 200 으로 내리므로 ApiClient 는 던지지 않는다.
    // 봉투를 그대로 돌려주고, 만료 판정은 상위(makeQueryOptions → QueryError)가 한다.
    const response = await apiFetch.get<MeResponseBody>('/me');

    expect(attempts).toBe(1);
    expect(response.data.error?.code).toBe('T003');
  });
});
