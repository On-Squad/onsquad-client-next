/**
 * 회귀 테스트: API 클라이언트 런타임 판정 (getIsBrowserRuntime)
 *
 * 배경:
 * - `typeof window !== 'undefined'` 만으로 판정하면 React Native 에서도 true 가 되어
 *   존재하지 않는 BFF(/api/bff)를 호출하게 된다. RN 에는 window 는 있지만 document 는 없다.
 * - isBrowser 는 모듈 전역 상태이므로 매 테스트마다 setBrowserRuntime(null) 로 되돌려
 *   테스트 간 오염을 막는다.
 */
import { afterEach, describe, expect, it } from 'vitest';

import { getIsBrowserRuntime, setBrowserRuntime } from '@/shared/api/runtime';

describe('getIsBrowserRuntime', () => {
  afterEach(() => {
    setBrowserRuntime(null);
  });

  it('브라우저 환경(window + document)에서는 브라우저로 판정한다', () => {
    expect(getIsBrowserRuntime()).toBe(true);
  });

  it('브라우저가 아니라고 명시적으로 지정하면(React Native 시나리오) 그 값을 따른다', () => {
    setBrowserRuntime(false);

    expect(getIsBrowserRuntime()).toBe(false);
  });

  it('명시 지정을 해제하면 다시 자동 판정으로 되돌아간다', () => {
    setBrowserRuntime(false);
    setBrowserRuntime(null);

    expect(getIsBrowserRuntime()).toBe(true);
  });

  it('document 가 없는 환경(React Native)에서는 window 가 있어도 브라우저가 아니라고 판정한다', () => {
    const documentDescriptor = Object.getOwnPropertyDescriptor(window, 'document');

    // jsdom 의 window.document 는 configurable getter 라 임시로 undefined 를 반환하도록 덮는다.
    Object.defineProperty(window, 'document', { configurable: true, get: () => undefined });

    try {
      expect(getIsBrowserRuntime()).toBe(false);
    } finally {
      // 원본 getter 를 복원해 이후 테스트(및 RTL)가 정상적인 jsdom document 를 쓰게 한다.
      if (documentDescriptor) Object.defineProperty(window, 'document', documentDescriptor);
    }
  });
});
