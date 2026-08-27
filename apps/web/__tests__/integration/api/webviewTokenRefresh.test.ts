/**
 * 웹뷰 토큰 만료 → auth.getToken 갱신 → 원요청 재시도 계약
 *
 * 배경:
 * - 웹뷰에서는 next-auth 세션 쿠키가 없어 session.update 기반 갱신이 동작하지 않는다.
 * - WebViewAuth 는 auth.getToken 브릿지를 registerSessionRefresh 에 등록해,
 *   API 가 401 을 받으면 RN 에서 새 토큰을 받아 원요청을 재시도한다.
 * - 갱신마저 실패하면(브릿지 에러·타임아웃) refreshSession() 이 false 를 반환하고
 *   만료 응답이 상위로 흘러 QueryCache 에서 로그아웃을 트리거한다.
 *
 * 이 테스트가 잠그는 것:
 *   1. 웹뷰에서 토큰이 만료되면 auth.getToken 을 통해 새 토큰을 받고 요청을 재시도한다
 *   2. auth.getToken 마저 실패하면 재시도하지 않고 만료 응답을 흘려보낸다
 */
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { server } from '../../setup/msw/server';

const TEST_API_BASE_URL = 'https://api.test.example';

interface AnnounceResponseBody {
  status: number;
  success: boolean;
  error?: { code: string; message: string };
  data?: { title: string; content: string };
}

const expiredBody: AnnounceResponseBody = {
  status: 401,
  success: false,
  error: { code: 'T003', message: '토큰이 만료되었습니다.' },
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('웹뷰에서 토큰 만료 시 auth.getToken 으로 갱신 후 재시도', () => {
  it('웹뷰에서 토큰이 만료되면 새 토큰을 받아 공지를 다시 불러온다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { apiFetch } = await import('@/shared/api/common');
    const { setBrowserRuntime } = await import('@/shared/api/runtime');
    const { registerSessionRefresh } = await import('@/shared/lib/auth/sessionRefresh');
    const { setAccessTokenProvider } = await import('@/shared/api/accessTokenProvider');

    // 웹뷰 런타임을 재현한다 — BFF 를 타지 않고 절대 baseUrl 로 나간다.
    setBrowserRuntime(false);

    let attempts = 0;
    let receivedAuthHeader: string | null = null;

    server.use(
      http.get<never, never, AnnounceResponseBody>(
        `${TEST_API_BASE_URL}/api/crews/1/announces/5`,
        ({ request }) => {
          attempts += 1;
          receivedAuthHeader = request.headers.get('Authorization');

          if (attempts === 1) {
            return HttpResponse.json(expiredBody);
          }

          return HttpResponse.json({
            status: 200,
            success: true,
            data: { title: '6월 정기 모임', content: '다음 주 토요일 오전 10시' },
          });
        },
      ),
    );

    const newToken = 'refreshed-access-token';
    let getTokenCallCount = 0;

    // WebViewAuth 가 등록하는 것과 동일한 갱신 함수를 직접 등록한다.
    registerSessionRefresh(async () => {
      getTokenCallCount += 1;

      // auth.getToken 이 새 토큰을 반환하면 provider 를 교체하고 true 를 반환한다.
      setAccessTokenProvider(() => newToken);
      return true;
    });

    const response = await apiFetch.get<AnnounceResponseBody>('/crews/1/announces/5');

    expect(attempts).toBe(2);
    expect(getTokenCallCount).toBe(1);
    expect(receivedAuthHeader).toBe(`Bearer ${newToken}`);
    expect(response.data.data?.title).toBe('6월 정기 모임');
  });

  it('auth.getToken 이 실패하면 재시도하지 않고 만료 응답을 흘려보낸다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { apiFetch } = await import('@/shared/api/common');
    const { setBrowserRuntime } = await import('@/shared/api/runtime');
    const { registerSessionRefresh } = await import('@/shared/lib/auth/sessionRefresh');

    setBrowserRuntime(false);

    let attempts = 0;

    server.use(
      http.get<never, never, AnnounceResponseBody>(
        `${TEST_API_BASE_URL}/api/crews/1/announces/5`,
        () => {
          attempts += 1;
          return HttpResponse.json(expiredBody);
        },
      ),
    );

    // WebViewAuth 구현은 브릿지 에러를 catch 해 false 를 반환한다.
    // 이 테스트는 그 catch 이후의 경로(갱신 포기 → 만료 응답 전달)를 검증한다.
    registerSessionRefresh(async () => false);

    const response = await apiFetch.get<AnnounceResponseBody>('/crews/1/announces/5');

    expect(attempts).toBe(1);
    expect(response.data.error?.code).toBe('T003');
  });
});
