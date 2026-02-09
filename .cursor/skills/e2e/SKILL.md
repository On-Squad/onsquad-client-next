---
name: e2e-playwright
description: |
  Next.js 프로젝트에서 Playwright 기반 E2E 테스트를 작성하기 위한 전용 스킬.
  E2E 테스트 케이스 생성, 테스트 코드 작성, 테스트 시나리오 분해 요청 시 자동 적용된다.
  본 프로젝트의 Playwright 테스트 컨벤션을 반드시 따른다.
scope: project
priority: high
tools: []
---

# Next.js Playwright E2E 테스트 규칙

## 목적

- 사용자 관점의 시나리오를 검증한다
- 구현 세부사항에 의존하지 않는 테스트를 작성한다
- 유지보수 가능한 E2E 테스트를 강제한다

## 프로젝트 구조

```
__tests__/

- e2e/
- integration/
- fixtures/
```

## 테스트 파일 규칙

- 모든 E2E 테스트 파일은 `.spec.ts` 확장자를 사용한다
- 파일명은 하이픈(-)으로 구분한다
- 하나의 파일은 하나의 사용자 시나리오 묶음을 다룬다

## 테스트 구조 규칙

- 모든 테스트는 상위 `test.describe`로 그룹화한다.
  - 상위 describe 제목은 `{[페이지/도메인]명} 플로우` 형식으로 작성.
- 관련 기능 단위로 `describe`를 중첩해 그룹핑한다.
  - 예: 채널 선택, 상세 패널, 다운로드 등
- 각 테스트 내 사용자 행동 단위는 `test.step`으로 구분한다.
- 공통 반복 동작은 `beforeEach` 또는 `beforeAll`에서 처리한다.
- 중첩 describe의 beforeEach는 상위 beforeEach를 상속받아 재사용 가능하다.

### e2e 테스트 예시 구조

```ts
import { expect, test } from '@playwright/test';

test.describe('크루 공지사항 플로우', () => {
  // 상위 beforeEach: 공통 페이지 진입
  test.beforeEach(async ({ page }) => {
    // ...
  });

  // 기능 단위 describe: 공지사항 리스트 관련 테스트
  test.describe('공지사항 리스트', () => {
    test('리스트에서 항목을 확인하고 클릭하면 상세 페이지로 이동한다', async ({ page }) => {
      await test.step('공지사항 리스트 페이지에 접속한다', async () => {
        // ...
      });

      await test.step('공지사항 리스트가 화면에 표시된다', async () => {
        // ...
      });

      await test.step('첫 번째 공지사항 항목 제목을 저장한다', async () => {
        // ...
      });

      await test.step('첫 번째 항목을 클릭한다', async () => {
        // ...
      });

      await test.step('상세 페이지로 이동했는지 확인한다', async () => {
        // ...
      });
    });
  });

  // 기능 단위 describe: 상세 페이지 관련 테스트
  test.describe('공지사항 상세페이지', () => {
    // 상세 페이지 공통 beforeEach
    test.beforeEach(async ({ page }) => {
      // ...
    });

    test('상세 페이지 UI 확인', async ({ page }) => {
      await test.step('공지사항 제목 확인', async () => {
        // ...
      });

      await test.step('작성자, 권한 뱃지, 작성날짜 확인', async () => {
        // ...
      });

      await test.step('상단고정, 수정 버튼 표시 확인', async () => {
        // ...
      });

      await test.step('본문(description) 확인', async () => {
        // ...
      });
    });
  });
});
```

## 헬퍼 / Page Object 규칙

- 3회 이상 반복되는 Locator 조회 또는 UI 동작은 **fixtures/pages** 또는 **fixtures/helpers**에 분리
- 페이지별 클래스(Page Object)로 작성 가능
  ```ts
  // 예시
  export class AnnouncePage {
    constructor(private page: Page) {}
    getAnnounceList(): Locator {
      return this.page.getByRole('list').filter({ hasText: /년.*월.*일/ });
    }
    getFirstItem(): Locator {
      return this.getAnnounceList().getByRole('listitem').first();
    }
  }
  ```
- 단순 Locator만 필요하면 헬퍼함수로 분리

```ts
// 예시
export const getAnnounceList = (page: Page) => page.getByRole('list').filter({ hasText: /년.*월.*일/ });
```

## 테스트 설명 규칙

- 테스트 이름은 자연어 문장으로 작성한다
- “무엇을 했을 때 어떤 결과가 나오는지”가 드러나야 한다

## Locator 전략

우선순위:

1. getByRole
2. getByLabel
3. getByText
4. getByPlaceholder
5. getByTestId (불가피한 경우)

금지:

- CSS selector 사용
- DOM 구조 의존 selector 사용

## Assertion 규칙

- 화면에 보이는 결과만 검증한다
- 내부 상태, API 응답 구조는 검증하지 않는다
- 하나의 테스트는 하나의 실패 원인만 가져야 한다

## 대기 처리 규칙

- page.waitForTimeout 사용 금지
- auto-wait을 신뢰하고 assertion으로 대기를 표현한다

## 테스트 데이터 관리

- 테스트 데이터는 fixtures 디렉토리에서 관리한다
- 하드코딩된 테스트 데이터 사용 금지

## API 모킹 규칙

- 외부 API 의존성이 있는 경우에만 사용한다
- 에러 시나리오 테스트에 한해 허용한다

## 인증 상태 관리

- 인증이 필요한 테스트는 storageState를 사용한다
- 로그인 과정을 매 테스트마다 반복하지 않는다

## 금지 패턴 요약

- 테스트 없이 기능 구현 먼저 작성
- CSS selector 사용
- waitForTimeout 사용
- 하나의 테스트에서 여러 시나리오 검증
