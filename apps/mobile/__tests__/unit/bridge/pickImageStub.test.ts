import { BRIDGE_VERSION } from '@onsquad/bridge';
import { handleWebMessage } from '@onsquad/bridge/native';
import { describe, expect, it } from 'vitest';

import type { BridgeHandlers } from '@onsquad/bridge/native';

import { pickImageStub } from '../../../src/shared/lib/pickImageStub';

/**
 * 작성 화면의 이미지 버튼이 계약 끝까지 이어지는지 본다.
 *
 * 웹이 실제로 보내는 media.pickImage 요청 문자열을 그대로 흘려보내고,
 * 앱이 웹으로 되돌려주는 응답에 본문에 넣을 URI 가 담기는지 확인한다.
 * 앱이 붙이는 핸들러는 화면(AnnounceDetailScreen)이 쓰는 것과 같은 pickImageStub 이다.
 */

const appHandlers: BridgeHandlers = {
  'media.pickImage': (req) => pickImageStub(Number((req as { max: number }).max)),
};

const requestFromWeb = (id: string, max: number) =>
  JSON.stringify({ v: BRIDGE_VERSION, id, method: 'media.pickImage', req: { max } });

/** handleWebMessage 는 Promise.resolve().then(handler).then(inject) 로 응답한다. */
const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const sendToApp = async (message: string) => {
  const scripts: string[] = [];

  handleWebMessage(message, appHandlers, (script) => scripts.push(script));
  await flushMicrotasks();

  const last = scripts[scripts.length - 1];

  if (!last) return null;

  const match = last.match(/window\.__onNative\((.+)\); true;/);

  if (!match) return null;

  return JSON.parse(JSON.parse(match[1])) as {
    id: string;
    res?: { uris: string[] };
    error?: { code: string };
  };
};

describe('작성 화면 이미지 버튼 → media.pickImage', () => {
  it('이미지 버튼이 1장을 요청하면 앱이 본문에 넣을 URI 를 돌려준다', async () => {
    const response = await sendToApp(requestFromWeb('pick-1', 1));

    expect(response?.res?.uris).toHaveLength(1);
    expect(response?.res?.uris[0]).toBe('https://via.placeholder.com/300');
  });

  it('앱의 응답이 요청과 같은 id 로 돌아와 웹의 대기가 풀린다', async () => {
    const response = await sendToApp(requestFromWeb('pick-2', 1));

    expect(response?.id).toBe('pick-2');
    expect(response?.error).toBeUndefined();
  });

  it('돌려준 URI 는 본문에 그대로 넣을 수 있는 주소다', async () => {
    const response = await sendToApp(requestFromWeb('pick-3', 1));

    const uri = response?.res?.uris[0] ?? '';

    expect(uri.startsWith('https://')).toBe(true);
  });

  it('0장을 요청하면 아무것도 고르지 않은 것으로 보고 본문에 넣을 URI 가 없다', async () => {
    const response = await sendToApp(requestFromWeb('pick-4', 0));

    expect(response?.res?.uris).toHaveLength(0);
  });
});
