/**
 * 웹뷰 토큰 만료 → auth.getToken 갱신 → 재시도 계약 (네이티브 쪽)
 *
 * 웹뷰는 자기 토큰이 만료됐는지 401 을 받고 나서야 안다. 그때 `auth.getToken` 을 다시 부른다.
 * 셸이 같은 토큰을 그대로 돌려주면 재시도가 같은 401 을 또 맞아 사용자는 로그아웃된다.
 * 이 테스트는 브릿지 봉투를 실제로 흘려보내며(handleWebMessage) 그 지점을 잠근다.
 *
 * RN 컴포넌트는 import 하지 않는다(Flow 파서 제약) — 화면 대신 브릿지 핸들러를 직접 구동한다.
 */
import { BRIDGE_VERSION } from '@onsquad/bridge';
import { handleWebMessage, type BridgeHandlers } from '@onsquad/bridge/native';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Keychain 은 네이티브 모듈이라 테스트 환경에 없다. 저장은 이 테스트의 관심사가 아니다.
vi.mock('react-native-keychain', () => ({
  setGenericPassword: vi.fn(async () => true),
  getGenericPassword: vi.fn(async () => false),
  resetGenericPassword: vi.fn(async () => true),
}));

import { installSessionRefresh } from '../../../src/auth/authService';
import { clearShellSession, setShellAccessToken, setShellRefreshToken } from '../../../src/auth/session';
import { grantShellAccessToken, resetShellTokenGrant } from '../../../src/auth/shellTokenGrant';
import { registerSessionRefresh } from '../../../src/shared/lib/auth/sessionRefresh';
import { server } from '../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

const EXPIRED_ACCESS_TOKEN = 'expired-access-token';
const REFRESH_TOKEN = 'valid-refresh-token';
const RENEWED_ACCESS_TOKEN = 'renewed-access-token';

/** 웹이 보내는 auth.getToken 요청 봉투. 계약상 req 는 없다(void). */
const getTokenRequest = (id: string) => JSON.stringify({ v: BRIDGE_VERSION, id, method: 'auth.getToken' });

interface TokenResult {
  res?: { accessToken: string; expiresAt: number };
  error?: { code: string; message?: string };
}

/**
 * 웹이 auth.getToken 을 부르고 답을 받는 한 왕복을 그대로 재현한다.
 * 화면이 등록하는 것과 같은 핸들러(grantShellAccessToken)를 쓴다.
 *
 * 갱신 경로는 실제 HTTP(/auth/reissue)를 타므로 microtask 만으로는 답이 오지 않는다.
 * 브릿지가 주입 스크립트를 내놓는 그 순간을 기다린다.
 */
const askTokenFromWebView = (id: string): Promise<TokenResult> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('브릿지가 응답을 보내지 않았다')), 3000);

    const handlers: BridgeHandlers = { 'auth.getToken': () => grantShellAccessToken() };

    handleWebMessage(getTokenRequest(id), handlers, (script) => {
      clearTimeout(timer);

      const match = script.match(/window\.__onNative\((.+)\); true;/);

      if (!match) {
        reject(new Error('브릿지 주입 스크립트를 읽지 못했다'));

        return;
      }

      resolve(JSON.parse(JSON.parse(match[1])) as TokenResult);
    });
  });

beforeEach(() => {
  resetShellTokenGrant();
  setShellAccessToken(EXPIRED_ACCESS_TOKEN);
  setShellRefreshToken(REFRESH_TOKEN);
});

afterEach(() => {
  registerSessionRefresh(null);
  clearShellSession();
  resetShellTokenGrant();
});

describe('웹뷰가 토큰 만료를 겪을 때', () => {
  it('401 을 맞고 다시 물어오면 갱신된 새 토큰을 건네 로그아웃되지 않는다', async () => {
    let sessionLostCount = 0;
    let sentRefreshToken: string | undefined;

    server.use(
      http.post(`${BASE}/auth/reissue`, async ({ request }) => {
        const body = (await request.json()) as { refreshToken: string };

        sentRefreshToken = body.refreshToken;

        return HttpResponse.json({
          status: 200,
          success: true,
          data: { accessToken: RENEWED_ACCESS_TOKEN, refreshToken: 'renewed-refresh-token' },
        });
      }),
    );

    installSessionRefresh(() => {
      sessionLostCount += 1;
    });

    // 웹뷰가 처음 부팅하며 토큰을 받는다.
    const first = await askTokenFromWebView('req-1');

    expect(first.res?.accessToken).toBe(EXPIRED_ACCESS_TOKEN);

    // 그 토큰으로 보낸 API 가 401 을 받아 웹이 다시 물어온다.
    const second = await askTokenFromWebView('req-2');

    expect(second.res?.accessToken).toBe(RENEWED_ACCESS_TOKEN);
    expect(sentRefreshToken).toBe(REFRESH_TOKEN);
    expect(sessionLostCount).toBe(0);
  });

  it('갱신까지 실패하면 실패를 알려 로그아웃으로 이어진다', async () => {
    let sessionLostCount = 0;

    server.use(
      http.post(`${BASE}/auth/reissue`, () =>
        HttpResponse.json(
          { status: 401, success: false, error: { code: 'T003', message: '토큰이 만료되었습니다.' } },
          { status: 401 },
        ),
      ),
    );

    installSessionRefresh(() => {
      sessionLostCount += 1;
    });

    await askTokenFromWebView('req-1');

    const second = await askTokenFromWebView('req-2');

    expect(second.res).toBeUndefined();
    expect(second.error?.code).toBe('INTERNAL');
    expect(sessionLostCount).toBe(1);
  });

  it('갱신에 성공하면 그 다음 화면은 새 토큰을 처음부터 받는다', async () => {
    let reissueCount = 0;

    server.use(
      http.post(`${BASE}/auth/reissue`, () => {
        reissueCount += 1;

        return HttpResponse.json({
          status: 200,
          success: true,
          data: { accessToken: RENEWED_ACCESS_TOKEN, refreshToken: 'renewed-refresh-token' },
        });
      }),
    );

    installSessionRefresh(() => {});

    await askTokenFromWebView('req-1');
    await askTokenFromWebView('req-2');

    // 상세에서 수정으로 넘어가며 새 웹뷰가 뜬다 — 이전 화면의 발급 기록은 지워진다.
    resetShellTokenGrant();

    const onNextScreen = await askTokenFromWebView('req-3');

    expect(onNextScreen.res?.accessToken).toBe(RENEWED_ACCESS_TOKEN);
    expect(reissueCount).toBe(1);
  });
});
