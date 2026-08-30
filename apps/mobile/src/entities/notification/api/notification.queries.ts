import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { QueryError } from '../../../shared/lib/queries/makeQueryOptions';
import { notificationListGetFetch } from './notificationListGetFetch';
import type { NotificationListGetFetchResponse } from './notificationListGetFetch';

const PAGE_SIZE = 10;
const BADGE_SIZE = 20;

/**
 * 응답 봉투를 벗긴다.
 *
 * **백엔드는 인증 실패도 HTTP 200 으로 내려준다.** 그래서 실패한 응답에는 `data` 가
 * 아예 없고, 벗기지 않고 `res.data.data.resultsSize` 를 읽으면 TypeError 가 난다 —
 * 화면에는 오류 폴백이 아니라 빨간 화면이 뜬다(에뮬레이터 실측).
 *
 * 던진 에러는 `ErrorHandlingWrapper` 의 경계가 받아 폴백을 그린다.
 * 다른 쿼리들이 `makeQueryOptions` 로 하는 일과 같지만, 그 헬퍼는 `queryOptions`
 * 전용이라 무한쿼리에는 쓸 수 없어 여기서 직접 한다.
 */
const unwrap = (res: { data: NotificationListGetFetchResponse }) => {
  if (res.data.error) {
    throw new QueryError(res.data.error.code, res.data.error.message);
  }

  return res.data.data;
};

export const notificationQueries = {
  root: () => ['notification'],

  /**
   * **페이지 번호는 1부터다.** 알림 목록 API 는 `page=0` 과 `page=1` 에 같은 첫 페이지를
   * 돌려준다(응답의 `page` 가 둘 다 1 로 오는 것으로 확인). 0 부터 시작하면 첫 페이지를
   * 두 번 받아 같은 알림이 목록에 두 번 들어가고, SectionList 의 키가 겹친다(실측).
   * 크루 목록(`crewQueries.infiniteList`)도 같은 이유로 1 부터 센다.
   */
  infiniteList: () =>
    infiniteQueryOptions({
      queryKey: [...notificationQueries.root(), 'infinite', { size: PAGE_SIZE }],
      queryFn: async ({ pageParam }) => {
        const data = unwrap(await notificationListGetFetch({ page: pageParam, size: PAGE_SIZE }));

        return {
          data,
          nextPage: data.resultsSize === PAGE_SIZE ? pageParam + 1 : undefined,
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
    }),

  /** 벨 배지용. 최근 20건 중 안읽은 개수를 반환한다. */
  badge: () =>
    queryOptions({
      queryKey: [...notificationQueries.root(), 'badge'],
      queryFn: async () => {
        const data = unwrap(await notificationListGetFetch({ page: 1, size: BADGE_SIZE }));

        return data.results.filter((item) => !item.read).length;
      },
    }),
};
