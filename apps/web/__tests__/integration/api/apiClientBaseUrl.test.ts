/**
 * 회귀 테스트: ApiClient 의 base URL 선택 계약
 *
 * 배경:
 * - shared/api/common.ts 는 브라우저 판정(getIsBrowserRuntime)에 따라 인증 요청의
 *   목적지를 BFF(/api/bff) 또는 NEXT_PUBLIC_API_BASE_URL 직접 호출로 가른다.
 * - React Native 는 window 는 있지만 document 가 없어 브라우저가 아닌 것으로 판정된다.
 *   이때도 BFF 로 요청이 새면 존재하지 않는 라우트를 호출하게 되므로,
 *   "비브라우저에서는 NEXT_PUBLIC_API_BASE_URL 로 직접, 토큰은 명시적으로" 라는 계약을 잠근다.
 *
 * 격리 전략:
 * - apiFetch / publicApiFetch 는 모듈 top-level 에서 `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
 *   로 base URL 을 1회만 계산해 싱글턴으로 export 한다. 이 저장소의 테스트 환경(vitest, mode=test)에는
 *   NEXT_PUBLIC_API_BASE_URL 을 채우는 .env.test 가 없어 기본값은 undefined 다.
 *   그 값에 의존하면 "undefined/api" 라는 우연한 문자열에 계약이 고정되므로,
 *   vi.stubEnv 로 알려진 값을 주입한 뒤 vi.resetModules() + 동적 import 로 모듈을 신선화해
 *   결정론적으로 검증한다 (get-query-client.test.ts / handleTokenExpiration.test.ts 와 동일 패턴).
 * - runtime.ts 의 isBrowser 역시 모듈 전역 상태라 resetModules 로 매 테스트 초기화된다.
 */
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { server } from '../../setup/msw/server';

const TEST_API_BASE_URL = 'https://api.test.example';

const okBody = { success: true, status: 200 };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('apiFetch / publicApiFetch — base URL 선택', () => {
  it('브라우저 판정일 때 인증 요청은 BFF(/api/bff)로 나간다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { apiFetch } = await import('@/shared/api/common');
    const { setBrowserRuntime } = await import('@/shared/api/runtime');

    setBrowserRuntime(true);

    let requestedUrl = '';
    server.use(
      http.get('http://localhost/api/bff/probe', ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json(okBody);
      }),
    );

    await apiFetch.get('/probe');

    expect(requestedUrl).toBe('http://localhost/api/bff/probe');
  });

  it('브라우저가 아닐 때(React Native 시나리오) 인증 요청은 NEXT_PUBLIC_API_BASE_URL 로 직접 나간다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { apiFetch } = await import('@/shared/api/common');
    const { setBrowserRuntime } = await import('@/shared/api/runtime');

    setBrowserRuntime(false);

    let requestedUrl = '';
    server.use(
      http.get(`${TEST_API_BASE_URL}/api/probe`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json(okBody);
      }),
    );

    await apiFetch.get('/probe');

    expect(requestedUrl).toBe(`${TEST_API_BASE_URL}/api/probe`);
  });

  it('publicApiFetch 는 브라우저 판정과 무관하게 항상 NEXT_PUBLIC_API_BASE_URL 로 나간다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { publicApiFetch } = await import('@/shared/api/common');
    const { setBrowserRuntime } = await import('@/shared/api/runtime');

    // 브라우저로 판정되어도(BFF 를 탈 법한 조건이어도) publicApiFetch 는 clientBaseUrl 이 없어 영향받지 않는다.
    setBrowserRuntime(true);

    let requestedUrl = '';
    server.use(
      http.get(`${TEST_API_BASE_URL}/api/probe`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json(okBody);
      }),
    );

    await publicApiFetch.get('/probe');

    expect(requestedUrl).toBe(`${TEST_API_BASE_URL}/api/probe`);
  });

  it('비브라우저에서 accessToken 을 넘기면 Authorization 헤더로 직접 실린다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { apiFetch } = await import('@/shared/api/common');
    const { setBrowserRuntime } = await import('@/shared/api/runtime');

    setBrowserRuntime(false);

    let authorizationHeader: string | null = null;
    server.use(
      http.get(`${TEST_API_BASE_URL}/api/probe`, ({ request }) => {
        authorizationHeader = request.headers.get('authorization');
        return HttpResponse.json(okBody);
      }),
    );

    await apiFetch.get('/probe', { accessToken: 'rn-access-token' });

    expect(authorizationHeader).toBe('Bearer rn-access-token');
  });
});
