import { HttpResponse, http } from 'msw';

const BASE = 'http://localhost:8080/api';

/**
 * **성공 경로만 둔다.** 실패·빈 결과는 각 테스트가 `server.use()` 로 덮는다.
 * 기본 핸들러에 실패를 섞으면 어느 테스트가 무엇을 기대하는지 읽을 수 없게 된다.
 */
export const crewHandlers = [
  http.post(`${BASE}/crews/:crewId/requests`, () =>
    HttpResponse.json({ status: 200, success: true }),
  ),
  http.delete(`${BASE}/crews/:crewId/requests/me`, () =>
    HttpResponse.json({ status: 200, success: true }),
  ),
  http.delete(`${BASE}/crews/:crewId/members/me`, () =>
    HttpResponse.json({ status: 200, success: true }),
  ),
  http.delete(`${BASE}/crews/:crewId/members/:targetMemberId`, () =>
    HttpResponse.json({ status: 200, success: true }),
  ),
  http.patch(`${BASE}/crews/:crewId/members/:targetMemberId/owner`, () =>
    HttpResponse.json({ status: 200, success: true }),
  ),
];
