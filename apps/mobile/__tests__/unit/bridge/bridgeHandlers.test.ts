import { BRIDGE_VERSION } from '@onsquad/bridge';
import { handleWebMessage } from '@onsquad/bridge/native';
import { describe, expect, it } from 'vitest';

import type { BridgeHandlers } from '@onsquad/bridge/native';

// 배럴(`Toast/index`)은 RN 컴포넌트인 Toaster 까지 끌고 와 Flow 파서에 걸린다 — 스토어만 직접 가져온다.
import { subscribeToast, toast } from '../../../src/shared/ui/Toast/toast';

/**
 * 브릿지 핸들러 단위 테스트.
 *
 * handleWebMessage 를 직접 구동해 핸들러가 올바른 응답을 돌려주는지 확인한다.
 * RN 컴포넌트는 import 하지 않는다(Flow 파서 제약).
 */

const makeRequest = (id: string, method: string, req: unknown = null) =>
  JSON.stringify({ v: BRIDGE_VERSION, id, method, req });

/**
 * handleWebMessage 내부에서 Promise.resolve().then(handler).then(inject) 로 실행되므로
 * microtask 를 최소 2번 비워야 스크립트가 주입된다.
 */
const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const captureScripts = () => {
  const scripts: string[] = [];

  return {
    inject: (script: string) => scripts.push(script),
    parseLastResponse: () => {
      const last = scripts[scripts.length - 1];

      if (!last) return null;

      // toScript: `window.__onNative && window.__onNative(<double-encoded>); true;`
      const match = last.match(/window\.__onNative\((.+)\); true;/);

      if (!match) return null;

      return JSON.parse(JSON.parse(match[1])) as unknown;
    },
  };
};

describe('auth.getToken 브릿지 핸들러', () => {
  it('핸들러가 반환한 accessToken 과 expiresAt 을 응답으로 돌려준다', async () => {
    const { inject, parseLastResponse } = captureScripts();

    const handlers: BridgeHandlers = {
      'auth.getToken': () => ({ accessToken: 'tok-abc', expiresAt: 9999999 }),
    };

    handleWebMessage(makeRequest('req-1', 'auth.getToken'), handlers, inject);
    await flushMicrotasks();

    const response = parseLastResponse() as { id: string; res: { accessToken: string; expiresAt: number } };

    expect(response.id).toBe('req-1');
    expect(response.res.accessToken).toBe('tok-abc');
    expect(response.res.expiresAt).toBe(9999999);
  });

  it('accessToken 이 빈 문자열이면 그대로 반환한다', async () => {
    const { inject, parseLastResponse } = captureScripts();

    const handlers: BridgeHandlers = {
      'auth.getToken': () => ({ accessToken: '', expiresAt: 0 }),
    };

    handleWebMessage(makeRequest('req-2', 'auth.getToken'), handlers, inject);
    await flushMicrotasks();

    const response = parseLastResponse() as { res: { accessToken: string } };

    expect(response.res.accessToken).toBe('');
  });
});

describe('shell.push 브릿지 핸들러', () => {
  it('경로를 핸들러로 전달하고 성공 응답을 돌려준다', async () => {
    const { inject, parseLastResponse } = captureScripts();
    const pushed: string[] = [];

    const handlers: BridgeHandlers = {
      'shell.push': (req) => {
        pushed.push((req as { path: string }).path);
      },
    };

    handleWebMessage(makeRequest('req-3', 'shell.push', { path: '/crews/1/announce/2' }), handlers, inject);
    await flushMicrotasks();

    expect(pushed).toHaveLength(1);
    expect(pushed[0]).toBe('/crews/1/announce/2');

    const response = parseLastResponse() as { id: string; error?: unknown };

    expect(response.id).toBe('req-3');
    expect(response.error).toBeUndefined();
  });
});

describe('shell.replace 브릿지 핸들러', () => {
  it('경로를 핸들러로 전달하고 성공 응답을 돌려준다', async () => {
    const { inject, parseLastResponse } = captureScripts();
    const replaced: string[] = [];

    const handlers: BridgeHandlers = {
      'shell.replace': (req) => {
        replaced.push((req as { path: string }).path);
      },
    };

    handleWebMessage(makeRequest('req-4', 'shell.replace', { path: '/crews/1/announce/5' }), handlers, inject);
    await flushMicrotasks();

    expect(replaced).toHaveLength(1);
    expect(replaced[0]).toBe('/crews/1/announce/5');

    const response = parseLastResponse() as { id: string; error?: unknown };

    expect(response.id).toBe('req-4');
    expect(response.error).toBeUndefined();
  });
});

describe('media.pickImage 브릿지 핸들러', () => {
  it('더미 URI 목록을 그대로 반환한다', async () => {
    const { inject, parseLastResponse } = captureScripts();

    const DUMMY_URI = 'https://via.placeholder.com/300';

    const handlers: BridgeHandlers = {
      'media.pickImage': () => ({ uris: [DUMMY_URI] }),
    };

    handleWebMessage(makeRequest('req-5', 'media.pickImage', { max: 3 }), handlers, inject);
    await flushMicrotasks();

    const response = parseLastResponse() as { res: { uris: string[] } };

    expect(response.res.uris).toHaveLength(1);
    expect(response.res.uris[0]).toBe(DUMMY_URI);
  });
});

describe('웹뷰가 토스트를 요청하면', () => {
  it('셸의 토스트가 그 문구를 그대로 띄운다', async () => {
    const shown: (string | null)[] = [];
    const unsubscribe = subscribeToast((message) => shown.push(message));

    const { inject } = captureScripts();
    const handlers: BridgeHandlers = {
      'ui.toast': (req) => {
        const { message } = req as { message: string };

        toast(message);
      },
    };

    handleWebMessage(makeRequest('t1', 'ui.toast', { message: '상단에 고정했어요' }), handlers, inject);
    await flushMicrotasks();

    expect(shown[0]).toBe('상단에 고정했어요');

    unsubscribe();
  });
});
