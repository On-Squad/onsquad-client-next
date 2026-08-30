import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { installSessionRefresh } from '../../../src/auth/authService';
import { clearShellSession, getShellAccessToken, setShellRefreshToken } from '../../../src/auth/session';
import { registerSessionRefresh } from '../../../src/shared/lib/auth/sessionRefresh';
import { refreshSession } from '../../../src/shared/lib/auth/sessionRefresh';
import { server } from '../../setup/msw/server';

const BASE = 'http://localhost:8080/api';

// Keychain 은 네이티브 모듈이라 테스트에서 돌지 않는다. 저장 호출 여부만 보면 된다.
const setGenericPassword = vi.hoisted(() => vi.fn(async () => true));
const resetGenericPassword = vi.hoisted(() => vi.fn(async () => true));
const getGenericPassword = vi.hoisted(() => vi.fn(async () => false));

vi.mock('react-native-keychain', () => ({
  setGenericPassword,
  resetGenericPassword,
  getGenericPassword,
}));

beforeEach(() => {
  setGenericPassword.mockClear();
  clearShellSession();
});

afterEach(() => registerSessionRefresh(null));

describe('세션 갱신이 실패 봉투를 받았을 때', () => {
  it('실패한 봉투의 토큰은 쓰지 않고 세션을 정리한다', async () => {
    /**
     * 백엔드는 재발급 실패도 **HTTP 200** 으로 준다. 여기서는 봉투가 실패인데 `data` 까지
     * 들어 있는 최악의 경우를 세운다 — 봉투를 보지 않으면 이 쓰레기 토큰이 그대로 저장된다.
     */
    server.use(
      http.post(`${BASE}/auth/reissue`, () =>
        HttpResponse.json({
          status: 401,
          success: false,
          error: { code: 'T005', message: '리프레시 토큰을 찾을 수 없습니다.' },
          data: { accessToken: '못-쓰는-토큰', refreshToken: '못-쓰는-토큰' },
        }),
      ),
    );

    let sessionLost = false;

    setShellRefreshToken('만료된-리프레시-토큰');
    installSessionRefresh(() => {
      sessionLost = true;
    });

    await expect(refreshSession()).resolves.toBe(false);

    expect(sessionLost).toBe(true);
    expect(getShellAccessToken()).toBeUndefined();
    expect(setGenericPassword).not.toHaveBeenCalled();
  });

  it('정상 봉투면 새 토큰으로 갱신된다', async () => {
    server.use(
      http.post(`${BASE}/auth/reissue`, () =>
        HttpResponse.json({
          status: 201,
          success: true,
          data: { accessToken: '새-액세스-토큰', refreshToken: '새-리프레시-토큰' },
        }),
      ),
    );

    setShellRefreshToken('아직-쓸-수-있는-리프레시-토큰');
    installSessionRefresh(() => {});

    await expect(refreshSession()).resolves.toBe(true);

    expect(getShellAccessToken()).toBe('새-액세스-토큰');
  });
});
