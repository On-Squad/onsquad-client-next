import { describe, expect, it } from 'vitest';

describe('vitest 하네스', () => {
  it('node 프로젝트에서 DOM 없이 실행된다', () => {
    // `globalThis.document` 로 읽으면 RN tsconfig 에 DOM lib 이 없어 타입 에러가 난다.
    // `in` 은 속성 접근이 아니라 존재 확인이라 타입을 우회하지 않고도 같은 것을 본다.
    expect('document' in globalThis).toBe(false);
  });
});
