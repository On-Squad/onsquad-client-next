import { refreshSession } from '@/shared/lib/auth/sessionRefresh';

import { getProvidedAccessToken } from './accessTokenProvider';
import { ErrorCode, type ResponseModel } from './model';
import { getIsBrowserRuntime } from './runtime';
import { notifyRequestTimeout } from './timeoutNotifier';

// 공통 요청 타임아웃 15초 (백엔드 무응답 시 무한 대기 방지)
const REQUEST_TIMEOUT_MS = 15_000;

/** 백엔드가 모든 응답을 HTTP 200 으로 내려주므로 만료는 body error.code(T003) 로도 판별한다. */
const isTokenExpired = (status: number, meta?: ResponseModel): boolean =>
  status === 401 || meta?.error?.code === ErrorCode.T003;

/**
 * 응답 래퍼. axios 의 `{ data }` 형태를 유지해 기존 호출부(res.data.data)와 호환한다.
 */
export interface ApiResponse<T> {
  data: T;
  /** 응답 헤더(소셜 로그인의 location 등 헤더 기반 응답을 읽기 위함). */
  headers: Headers;
}

interface ApiClientOptions {
  baseUrl: string;
  /** 클라이언트(브라우저) 전용 base. 인증 호출을 BFF(/api/bff)로 보내 서버가 토큰을 주입하게 한다(토큰 비노출). 없으면 baseUrl 사용. */
  clientBaseUrl?: string;
  withAuth: boolean;
}

type RequestOptions = Omit<RequestInit, 'body' | 'method'> & { accessToken?: string };
type InternalRequestOptions = RequestInit & { accessToken?: string };

/**
 * fetch 기반 API 클라이언트. withAuth 인스턴스는 Bearer 토큰을 주입한다(클라: BFF가 서버 세션 토큰 주입 / 서버: 명시적 accessToken).
 */
class ApiClient {
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions) {
    this.options = options;
  }

  /**
   * 인증 헤더 주입.
   * - 클라이언트: 인증 호출은 BFF(/api/bff)로 가며 BFF가 서버 세션 토큰을 주입한다(여기선 미주입).
   * - 서버: 호출자가 명시적으로 넘긴 `accessToken` 만 사용한다.
   * - RN: 셸이 세션을 쥐므로 등록된 provider 에서 꺼낸다.
   *
   * 명시적 인자가 항상 우선이다. 브라우저는 둘 다 비어 있는 것이 정상이다.
   */
  private async getAuthHeaders(accessToken?: string): Promise<Record<string, string>> {
    if (!this.options.withAuth) return {};

    const token = accessToken ?? (await getProvidedAccessToken());

    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    path: string,
    options: InternalRequestOptions = {},
    allowRetry = true,
  ): Promise<ApiResponse<T>> {
    const { accessToken, ...fetchInit } = options;
    const authHeaders = await this.getAuthHeaders(accessToken);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;

    // BFF(/api/bff)는 브라우저에만 있다. 서버·RN 은 API 를 직접 호출하고 토큰을 명시적으로 넘긴다.
    const base =
      getIsBrowserRuntime() && this.options.clientBaseUrl ? this.options.clientBaseUrl : this.options.baseUrl;

    try {
      response = await fetch(`${base}${path}`, {
        signal: controller.signal,
        ...fetchInit,
        headers: {
          ...(fetchInit.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...authHeaders,
          ...fetchInit.headers,
        },
      });
    } catch (error) {
      // 타임아웃(AbortController) → 시스템 에러 노출 대신 재시도 안내 후 친화적 에러로 변환.
      if (controller.signal.aborted) {
        // 무엇을 보여줄지는 플랫폼이 등록한다. 여기서는 사실만 알린다.
        // (동적 import 로 웹 전용 모듈을 숨기려 해도 Metro 는 같은 번들에 적재한다)
        notifyRequestTimeout();

        throw new Error('잠시 후 다시 시도해 주세요.');
      }

      throw error;
    } finally {
      clearTimeout(timer);
    }

    const body = (await response.json().catch(() => undefined)) as T | undefined;

    const meta = body as ResponseModel | undefined;

    // 인증 인스턴스가 토큰 만료 응답을 받으면, 세션을 1회 갱신한 뒤 원요청을 재시도한다.
    // refreshSession 은 single-flight 라 동시 만료 요청들이 갱신 1회를 공유하고,
    // **등록된 갱신 함수가 없으면 false 를 반환하므로 레지스트리 자체가 게이트다.**
    //   브라우저 → session-provider('use client')가 등록 → 재시도
    //   Next 서버 → 등록 경로가 없음 → 재시도 안 함
    //   RN      → 셸의 authService 가 등록 → 재시도
    // 여기에 getIsBrowserRuntime() 를 두면 RN 이 막힌다 — 그 플래그는 75행에서 BFF 경유 여부도
    // 결정하는데 RN 은 거기서 false 여야 해서, 하나로 두 요구를 만족시킬 수 없다.
    // 갱신 실패 시 재시도하지 않고 만료 응답을 그대로 흘려보내 상위(QueryCache.onError)에서 로그아웃되게 한다.
    if (allowRetry && this.options.withAuth && isTokenExpired(response.status, meta)) {
      const refreshed = await refreshSession();

      if (refreshed) {
        return this.request<T>(path, options, false);
      }
    }

    // 2xx 가 아니면 axios 처럼 reject (React Query 가 에러로 처리)
    if (!response.ok) {
      throw Object.assign(new Error(meta?.error?.message ?? `잠시 후 다시 시도해주세요.`), {
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

export const publicApiFetch = new ApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
  withAuth: false,
});

export const apiFetch = new ApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
  clientBaseUrl: '/api/bff',
  withAuth: true,
});
