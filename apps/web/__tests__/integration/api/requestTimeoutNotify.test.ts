/**
 * 회귀 테스트: 요청 타임아웃 시 등록된 timeoutNotifier 호출 계약
 *
 * 배경:
 * - shared/api/common.ts 는 요청이 15초(REQUEST_TIMEOUT_MS) 안에 끝나지 않으면
 *   AbortController 로 요청을 끊는다. 기존에는 이 시점에 웹 전용 토스트 모듈을
 *   동적 import 로 직접 불러왔는데, Metro(React Native)는 코드 스플리팅을 하지 않아
 *   동적 import 도 같은 번들에 실려 RN 번들에 웹 UI 모듈이 섞여 들어가는 문제가 있었다.
 * - 그래서 "무엇을 보여줄지"는 플랫폼이 주입하고(setTimeoutNotifier), common.ts 는
 *   notifyRequestTimeout() 호출만 하도록 바뀐다. 이 테스트는 그 호출 계약
 *   (타임아웃 → notifier 호출 / 정상 응답 → 미호출)을 잠근다.
 *
 * 타이머 전략:
 * - 실제 15초를 기다리지 않는다. MSW 핸들러가 절대 응답하지 않는(영원히 pending) Promise 를
 *   반환하게 하고, vi.useFakeTimers() + vi.advanceTimersByTimeAsync(15_000) 로 common.ts
 *   내부의 setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) 를 강제로 발화시킨다.
 *   MSW 는 실제 소켓을 열지 않고 인터셉터 레벨에서 응답을 가로채므로, fake timer 로 흐르는
 *   가짜 시계와 충돌하지 않는다.
 * - withAuth 분기(토큰 갱신 등)는 이 계약과 무관하므로 publicApiFetch 로 검증 범위를 좁힌다.
 */
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { server } from '../../setup/msw/server';

const TEST_API_BASE_URL = 'https://api.test.example';

// common.ts 의 REQUEST_TIMEOUT_MS 와 동일한 값. 그 상수는 export 되지 않으므로 계약값으로 고정한다.
const REQUEST_TIMEOUT_MS = 15_000;

const okBody = { success: true, status: 200 };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.useRealTimers();
});

describe('응답 지연 시 재시도 안내', () => {
  it('응답이 오지 않으면 재시도 안내를 알린다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { publicApiFetch } = await import('@/shared/api/common');
    const { setTimeoutNotifier } = await import('@/shared/api/timeoutNotifier');

    let notifiedCount = 0;
    setTimeoutNotifier(() => {
      notifiedCount += 1;
    });

    // 응답하지 않는 핸들러 — 15초 안에 끝나지 않는 요청 상황을 흉내낸다.
    server.use(http.get(`${TEST_API_BASE_URL}/api/probe`, () => new Promise(() => {})));

    vi.useFakeTimers();

    const requestPromise = publicApiFetch.get('/probe').catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    const result = await requestPromise;

    expect(notifiedCount).toBe(1);
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe('잠시 후 다시 시도해 주세요.');
  });

  it('응답이 정상으로 오면 재시도 안내를 알리지 않는다', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', TEST_API_BASE_URL);
    vi.resetModules();

    const { publicApiFetch } = await import('@/shared/api/common');
    const { setTimeoutNotifier } = await import('@/shared/api/timeoutNotifier');

    let notifiedCount = 0;
    setTimeoutNotifier(() => {
      notifiedCount += 1;
    });

    server.use(http.get(`${TEST_API_BASE_URL}/api/probe`, () => HttpResponse.json(okBody)));

    await publicApiFetch.get('/probe');

    expect(notifiedCount).toBe(0);
  });
});
