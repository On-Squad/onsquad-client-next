import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './msw/server';

// 모킹되지 않은 요청이 조용히 나가면 안 된다 — 실제 백엔드를 때리고 있는데도
// 테스트가 통과하는 상황을 막는다.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
