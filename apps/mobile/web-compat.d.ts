/**
 * Phase 1.5 임시 — apps/web 소스를 RN 쪽에서 타입체크하기 위한 보정.
 *
 * 두 가지를 메운다. **둘 다 packages/core 정식 추출(Phase 4) 때 제대로 풀어야 할 항목이다.**
 *
 * 1) 전역 앰비언트 타입
 *    `apps/web/src/shared/types/custom.d.ts` 가 `export` 없이 선언한 전역이라
 *    파일을 다른 패키지로 옮기면 따라가지 않는다. 그 파일을 통째로 include 하지 않는 이유는
 *    안에 있는 `ArrayType<P extends Array>` 가 타입 인자 없는 `Array` 를 써서 그 자체로 에러이기 때문이다.
 *
 * 2) `window` / `document`
 *    RN 의 tsconfig lib 에는 DOM 이 없는데 `shared/api/runtime.ts` 가 런타임 판정에 `typeof` 로 참조한다.
 *    값으로 쓰지 않고 존재 여부만 보므로 `unknown` 으로 충분하다.
 *    lib 에 "dom" 을 통째로 넣지 않는 이유 — RN 코드가 실수로 DOM API 를 쓰는 걸 막기 위해서다.
 */

type PropType<T, K extends keyof T> = T[K];

declare const window: unknown;
declare const document: unknown;
