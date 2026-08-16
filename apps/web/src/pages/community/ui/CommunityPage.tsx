import { Suspense } from 'react';

import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

import { CommunityContainer } from '@/pages/community/ui';

import { crewQueries } from '@/entities/crew';

import { getQueryClient } from '@/shared/lib/queries/get-query-client';
import { Skeleton } from '@/shared/ui/Skeleton';

function CommunityPage() {
  const queryClient = getQueryClient();

  // 기다리지 않고(void) 요청만 띄운다 — 백엔드가 느려도 셸이 즉시 스트리밍된다.
  // get-query-client 의 shouldDehydrateQuery 가 pending 쿼리까지 dehydrate 하므로,
  // 진행 중인 요청 그대로 클라이언트로 넘어가 이어받는다(중복 요청 없음).
  // prefetchQuery 는 에러를 throw 하지 않고, 무응답은 ApiClient 의 15초 타임아웃이 막는다.
  void queryClient.prefetchQuery(crewQueries.list());

  return (
    <div className="h-full w-full">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<Skeleton.CrewList className="pt-6" />}>
          <CommunityContainer />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}

export default CommunityPage;
