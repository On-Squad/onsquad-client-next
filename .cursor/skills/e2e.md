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

- 모든 테스트는 `test.describe`로 그룹화한다
- 사용자 행동 단위는 `test.step`으로 구분한다
- `beforeEach`는 페이지 진입 및 공통 준비만 담당한다

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
