import { refreshSession } from '../lib/auth/sessionRefresh';

import { getProvidedAccessToken } from './accessTokenProvider';
import { ErrorCode, type ResponseModel } from './model';

// 공통 요청 타임아웃 15초 (백엔드 무응답 시 무한 대기 방지)
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * 백엔드가 **인증 실패도 HTTP 200** 으로 내려주므로 만료는 body error.code 로 판별한다.
 * `response.ok` 는 항상 참이라 여기서 걸러내지 못하면 봉투가 화면까지 흘러간다(실측).
 *
 * **T004(토큰이 필요한 API)도 갱신 대상이다.** 만료(T003)와 원인은 다르지만
 * 토큰이 붙지 못한 요청이 갱신 완료 전에 나갈 수 있고, 그때 서버는 T004 로 답한다.
 * 웹 `apps/web/src/shared/api/common.ts` 와 같은 판정을 쓴다.
 *
 * **T002(서명 불일치)는 넣지 않는다.** 갱신해도 풀리지 않아 재시도가 낭비된다.
 */
const isTokenExpired = (status: number, meta?: ResponseModel): boolean =>
  status === 401 || meta?.error?.code === ErrorCode.T003 || meta?.error?.code === ErrorCode.T004;

/**
 * 응답 래퍼. 웹과 같은 `{ data, headers }` 형태를 유지한다 —
 * 호출부(`res.data.data`)를 웹에서 그대로 옮겨오기 위해서다.
 */
export interface ApiResponse<T> {
  data: T;
  /** 소셜 로그인의 `location` 등 헤더 기반 응답을 읽기 위함. */
  headers: Headers;
}

interface ApiClientOptions {
  baseUrl: string;
  withAuth: boolean;
}

type RequestOptions = Omit<RequestInit, 'body' | 'method'> & { accessToken?: string };
type InternalRequestOptions = RequestInit & { accessToken?: string };

/**
 * fetch 기반 API 클라이언트 — **RN 판**.
 *
 * 웹판과 다른 점 셋. 전부 "빠진 것"이다.
 *
 * 1. **BFF 경유가 없다.** 웹은 브라우저에서 `/api/bff` 로 보내 서버가 토큰을 꽂지만
 *    RN 에는 그 서버가 없다. 셸이 직접 `Authorization` 을 붙인다.
 * 2. **브라우저 런타임 판정이 없다.** 여기는 항상 RN 이다.
 *    웹판의 `getIsBrowserRuntime()` 하나가 BFF 경유(RN=false)와 갱신 재시도(RN=true)를
 *    동시에 게이트해 **한 플래그로 두 요구를 만족시킬 수 없었다** — 이 이관이 그 문제를 없앤다.
 * 3. **타임아웃 알림 레지스트리가 없다.** 웹은 토스트를 데이터 레이어에서 떼어내려고
 *    주입 구조를 썼지만, RN 은 화면이 에러를 직접 받아 처리한다.
 */
class ApiClient {
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions) {
    this.options = options;
  }

  /** 명시적으로 넘긴 토큰이 우선, 없으면 셸이 등록한 provider 에서 꺼낸다. */
  private getAuthHeaders(accessToken?: string): Record<string, string> {
    if (!this.options.withAuth) return {};

    const token = accessToken ?? getProvidedAccessToken();

    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    path: string,
    options: InternalRequestOptions = {},
    allowRetry = true,
  ): Promise<ApiResponse<T>> {
    const { accessToken, ...fetchInit } = options;
    const authHeaders = this.getAuthHeaders(accessToken);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(`${this.options.baseUrl}${path}`, {
        signal: controller.signal,
        ...fetchInit,
        headers: {
          ...(fetchInit.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...authHeaders,
          ...fetchInit.headers,
        },
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error('잠시 후 다시 시도해 주세요.');
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }

    const body = (await response.json().catch(() => undefined)) as T | undefined;

    const meta = body as ResponseModel | undefined;

    // 만료를 받으면 세션을 1회 갱신하고 원요청을 재시도한다.
    // refreshSession 은 single-flight 라 동시에 만료를 받은 요청들이 갱신 1회를 공유한다.
    // 등록된 갱신 함수가 없으면 false 를 반환하므로 레지스트리 자체가 게이트다.
    if (allowRetry && this.options.withAuth && isTokenExpired(response.status, meta)) {
      const refreshed = await refreshSession();

      if (refreshed) {
        return this.request<T>(path, options, false);
      }
    }

    // 2xx 가 아니면 reject — React Query 가 에러로 처리한다.
    if (!response.ok) {
      throw Object.assign(new Error(meta?.error?.message ?? '잠시 후 다시 시도해주세요.'), {
        code: meta?.error?.code,
        status: response.status,
      });
    }

    return { data: body as T, headers: response.headers };
  }

  get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  put<T>(path: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  patch<T>(path: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: data === undefined ? undefined : data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

// 이름이 `NEXT_PUBLIC_` 인 것은 웹에서 온 관성이다. 지금 RN 이 이 값으로 돌고 있어 그대로 둔다 —
// 바꾸려면 .env · 빌드 설정 · 에뮬레이터 스크립트를 같이 손대야 해서 별도 작업이다.
const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

export const publicApiFetch = new ApiClient({ baseUrl: BASE_URL, withAuth: false });

export const apiFetch = new ApiClient({ baseUrl: BASE_URL, withAuth: true });
