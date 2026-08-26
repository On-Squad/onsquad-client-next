import { defineConfig } from 'vitest/config';

/**
 * 환경을 두 프로젝트로 나눈다. 명령은 여전히 `vitest run` 하나다.
 *
 * 전부 jsdom 으로 돌려도 통과하지만, DOM 이 필요 없는 테스트까지 매번 브라우저 흉내
 * 환경과 MSW 서버를 세우게 된다. 테스트가 늘수록 이 비용이 쌓인다.
 *
 * 나누는 기준은 확장자가 아니라 **디렉터리**다 — `__tests__/unit` 은 node,
 * `__tests__/integration` 은 jsdom.
 *
 * **RN 컴포넌트는 어느 프로젝트에서도 import 하지 않는다.** RN 0.86 소스가 Flow 라
 * esbuild 가 파싱하지 못한다. 화면 검증은 에뮬레이터 실측이 맡는다.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['__tests__/unit/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['__tests__/integration/**/*.test.ts'],
          setupFiles: ['./__tests__/setup/vitest.setup.ts'],
          // `shared/api/common.ts` 가 모듈 로드 시점에 baseUrl 을 계산한다.
          // 앱은 index.js 가 넣어주지만 테스트는 그 경로를 거치지 않는다 —
          // 비워두면 `undefined/api/...` 로 나가 MSW 가 못 알아본다.
          env: { NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8080' },
          // ApiClient 가 절대 URL 을 쓰므로 base URL 자체는 중요하지 않지만,
          // about:blank 에서는 fetch 가 막힌다.
          environmentOptions: { jsdom: { url: 'http://localhost' } },
        },
      },
    ],
  },
});
