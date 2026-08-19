import { queryOptions } from '@tanstack/react-query';

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

/**
 * 응답 봉투를 벗겨 `error` 가 있으면 던지는 쿼리 옵션.
 *
 * **반환 타입을 명시하지 않는다.** 웹은 `UseQueryOptions` 로 못박았는데
 * 그러면 `useSuspenseQuery` 에 넘길 수 없다(타입이 더 좁다).
 * `queryOptions()` 의 추론에 맡기면 `useQuery` · `useSuspenseQuery` 양쪽에 쓸 수 있다.
 *
 * **`throwOnError: false` 를 두지 않는 것도 웹과 다르다.**
 * 웹은 위젯 하나의 실패가 화면 전체를 막지 않게 하려고 껐지만,
 * RN 은 화면마다 `ErrorHandlingWrapper` 를 둬서 **그 화면 안에서만** 폴백을 그린다.
 * 여기서 끄면 에러가 경계까지 올라가지 못해 폴백이 영원히 안 나온다.
 */
export const makeQueryOptions = <TQueryKey extends readonly unknown[], TQueryFnData extends ResponseModel>(
  queryKey: TQueryKey,
  queryFn: () => Promise<ApiResponse<TQueryFnData>>,
) =>
  queryOptions({
    queryKey,
    queryFn: async () => {
      const res = await queryFn();

      if (res.data.error) {
        throw new QueryError(res.data.error.code, res.data.error.message);
      }

      return res.data;
    },
  });
