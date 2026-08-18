import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import type { ApiResponse } from '../../api/common';
import type { ErrorCode, ResponseModel } from '../../api/model';

/**
 * 응답 봉투의 `error` 를 던지기 위한 에러.
 * 웹은 `useApiQuery.ts` 에 있지만 RN 은 그 훅을 쓰지 않아 여기 둔다.
 */
export class QueryError extends Error {
  code: ErrorCode | string;
  message: string;

  constructor(code: ErrorCode | string, message: string) {
    super();

    this.code = code;
    this.message = message;
  }
}

export const makeQueryOptions = <
  TQueryKey extends readonly unknown[],
  TQueryFnData extends ResponseModel,
  TError = Error,
  TData = TQueryFnData,
>(
  queryKey: TQueryKey,
  queryFn: () => Promise<ApiResponse<TQueryFnData>>,
): UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> => {
  return queryOptions<TQueryFnData, TError, TData, TQueryKey>({
    queryKey,
    queryFn: async () => {
      const res = await queryFn();

      if (res.data.error) {
        throw new QueryError(res.data.error.code, res.data.error.message);
      }

      return res.data;
    },
    // 만료를 포함한 로그아웃 처리는 queryClient 의 QueryCache.onError 에서 중앙화한다.
    throwOnError: false,
  });
};
