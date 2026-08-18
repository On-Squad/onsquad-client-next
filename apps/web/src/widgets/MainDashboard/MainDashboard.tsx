import React from 'react';

import { Article } from '@/shared/ui/Article';
import { Text } from '@/shared/ui/Text';

/**
 * 메인페이지 대시보드.
 *
 * "크루 랭킹" 카드가 있었으나 제거했다 — **전역 크루 랭킹 API 가 서버에 없다.**
 * 혼동하기 쉬운 `crewHomeInfoGetFetch` 의 `rankers` 는 크루 랭킹이 아니라
 * **특정 크루의 크루원 랭킹**이고, 비멤버는 호출조차 못 한다.
 * 그래서 카드는 늘 "크루 랭킹이 없습니다."만 보여주고 있었다.
 * 서버에 전역 랭킹 API 가 생기면 그때 다시 붙인다.
 */
const MainDashboard = () => {
  return (
    <Article
      className="min-h-96 w-full shadow-sm"
      slot={
        <div className="flex flex-col gap-6">
          <div>
            <Text.lg className="font-semibold">
              <h3>크루에 합류하기</h3>
            </Text.lg>
          </div>

          <div className="font-semibold">
            <Text.base>크루를 개설하고 크루원을 모집하세요.</Text.base>
          </div>
        </div>
      }
    />
  );
};

export default MainDashboard;
