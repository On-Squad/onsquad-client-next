import { HttpResponse, http } from 'msw';

const BASE = 'http://localhost:8080/api';

/**
 * 알림 API 기본 핸들러 — 성공 경로만 둔다.
 * 실패·빈 결과·지연은 각 테스트 안에서 server.use() 로 덮어쓴다.
 */
export const notificationHandlers = [
  http.get(`${BASE}/members/me/notifications`, () =>
    HttpResponse.json({
      status: 200,
      success: true,
      data: {
        size: 10,
        page: 0,
        totalPages: 1,
        totalCount: 0,
        resultsSize: 0,
        results: [],
      },
    }),
  ),

  http.patch(`${BASE}/notifications/:notificationId/read`, () =>
    HttpResponse.json({ status: 200, success: true }),
  ),

  http.patch(`${BASE}/notifications/read-all`, () =>
    HttpResponse.json({ status: 200, success: true }),
  ),
];
