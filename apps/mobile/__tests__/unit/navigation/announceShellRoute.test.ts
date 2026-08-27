import { BRIDGE_VERSION } from '@onsquad/bridge';
import { handleWebMessage, type BridgeHandlers } from '@onsquad/bridge/native';
import { describe, expect, it } from 'vitest';

import {
  resolveAnnouncePushIntent,
  resolveAnnounceReplaceIntent,
  type AnnounceShellIntent,
} from '../../../src/navigation/announceShellRoute';

/**
 * 웹뷰가 보낸 shell.push / shell.replace 가 네이티브 스택에서 어떻게 보이는지 검증한다.
 *
 * RN 컴포넌트는 import 하지 않는다(RN 0.86 소스가 Flow 라 esbuild 가 파싱하지 못한다).
 * 대신 AnnounceDetailScreen 이 하는 것과 같은 배선을 여기서 만든다 —
 * 브릿지 메시지를 그대로 흘려 넣고, 네이티브 스택 대신 같은 규칙으로 움직이는 가짜 스택을 본다.
 */

/** 화면 한 장. 사용자가 지금 무엇을 보고 있는지에 해당한다. */
interface StackEntry {
  screen: string;
  title?: string;
  announceId?: number;
  url?: string;
}

/**
 * native-stack 과 같은 규칙으로 움직이는 가짜 스택.
 * - push: 위에 한 장 더 쌓는다
 * - replace: 맨 위 한 장을 갈아 끼운다(쌓이지 않는다)
 * - navigate: 스택에 이미 있는 화면이면 거기까지 걷어내고 돌아간다
 * - goBack: 맨 위 한 장을 걷어낸다
 */
const createStack = (initial: StackEntry[]) => {
  const entries = [...initial];

  return {
    push: (entry: StackEntry) => entries.push(entry),
    replace: (entry: StackEntry) => entries.splice(entries.length - 1, 1, entry),
    navigate: (entry: StackEntry) => {
      const found = entries.findIndex(({ screen }) => screen === entry.screen);

      if (found === -1) {
        entries.push(entry);

        return;
      }

      entries.length = found + 1;
    },
    goBack: () => entries.pop(),
    /** 사용자가 지금 보고 있는 화면. */
    current: () => entries[entries.length - 1],
    screens: () => entries.map(({ screen, title }) => title ?? screen),
  };
};

const toEntry = (intent: AnnounceShellIntent): StackEntry =>
  intent.screen === 'AnnounceList'
    ? { screen: 'AnnounceList' }
    : {
        screen: 'AnnounceDetail',
        title: intent.params.title,
        announceId: intent.params.announceId,
        url: intent.params.url,
      };

/** AnnounceDetailScreen 의 배선을 그대로 옮긴 핸들러. */
const createHandlers = (stack: ReturnType<typeof createStack>, crewName: string): BridgeHandlers => {
  const apply = (intent: AnnounceShellIntent | null) => {
    if (!intent) {
      throw new Error('알 수 없는 경로');
    }

    const entry = toEntry(intent);

    if (intent.action === 'navigate') stack.navigate(entry);
    else if (intent.action === 'replace') stack.replace(entry);
    else stack.push(entry);
  };

  return {
    'shell.push': (req) => apply(resolveAnnouncePushIntent((req as { path: string }).path, { crewName })),
    'shell.replace': (req) => apply(resolveAnnounceReplaceIntent((req as { path: string }).path, { crewName })),
  };
};

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

/** 웹이 보낸 브릿지 요청 한 건을 흘려 넣고, 네이티브가 돌려준 응답을 읽는다. */
const sendFromWeb = async (handlers: BridgeHandlers, method: 'shell.push' | 'shell.replace', path: string) => {
  const scripts: string[] = [];

  handleWebMessage(JSON.stringify({ v: BRIDGE_VERSION, id: 'req-1', method, req: { path } }), handlers, (script) =>
    scripts.push(script),
  );
  await flushMicrotasks();

  const last = scripts[scripts.length - 1] ?? '';
  const match = last.match(/window\.__onNative\((.+)\); true;/);

  return match ? (JSON.parse(JSON.parse(match[1])) as { error?: { code: string } }) : null;
};

describe('웹뷰에서 다음 화면으로 갈 때', () => {
  it('공지를 열면 상세가 스택에 쌓이고, 뒤로 가면 목록이 다시 보인다', async () => {
    const stack = createStack([{ screen: 'AnnounceList' }]);

    await sendFromWeb(createHandlers(stack, '러닝크루'), 'shell.push', '/crews/3/announce/7');

    expect(stack.current().screen).toBe('AnnounceDetail');
    expect(stack.current().announceId).toBe(7);
    expect(stack.current().title).toBe('공지사항');

    stack.goBack();

    expect(stack.current().screen).toBe('AnnounceList');
  });

  it('글쓰기를 누르면 작성 화면이 목록 위에 쌓인다', async () => {
    const stack = createStack([{ screen: 'AnnounceList' }]);

    await sendFromWeb(createHandlers(stack, '러닝크루'), 'shell.push', '/crews/3/announce/write');

    expect(stack.current().title).toBe('공지 작성');
    expect(stack.current().url).toBe('http://localhost:3000/crews/3/announce/write');
    expect(stack.screens()).toEqual(['AnnounceList', '공지 작성']);
  });

  it('상세에서 수정을 누르면 수정 화면이 상세 위에 쌓인다', async () => {
    const stack = createStack([{ screen: 'AnnounceList' }, { screen: 'AnnounceDetail', title: '공지사항' }]);

    await sendFromWeb(createHandlers(stack, '러닝크루'), 'shell.push', '/crews/3/announce/7/edit');

    expect(stack.current().title).toBe('공지 수정');
    expect(stack.current().url).toBe('http://localhost:3000/crews/3/announce/7/edit');
    expect(stack.screens()).toEqual(['AnnounceList', '공지사항', '공지 수정']);
  });

  it('알 수 없는 경로를 받으면 화면을 쌓지 않고 웹에 실패를 알린다', async () => {
    const stack = createStack([{ screen: 'AnnounceList' }]);

    const response = await sendFromWeb(createHandlers(stack, '러닝크루'), 'shell.push', '/settings/profile');

    expect(stack.screens()).toEqual(['AnnounceList']);
    expect(response?.error).toBeDefined();
  });
});

describe('작성·수정을 마쳤을 때', () => {
  it('공지를 등록하면 목록이 보이고, 뒤로 가도 작성 폼으로 돌아가지 않는다', async () => {
    const stack = createStack([{ screen: 'AnnounceList' }, { screen: 'AnnounceDetail', title: '공지 작성' }]);

    // 웹은 저장 성공 후 목록 경로로 replace 한다(브라우저와 같은 이동 경로).
    await sendFromWeb(createHandlers(stack, '러닝크루'), 'shell.replace', '/crews/3/announce');

    expect(stack.current().screen).toBe('AnnounceList');
    expect(stack.screens()).not.toContain('공지 작성');
  });

  it('공지를 수정하면 상세가 보이고, 뒤로 가면 수정 폼이 아니라 목록으로 간다', async () => {
    const stack = createStack([{ screen: 'AnnounceList' }, { screen: 'AnnounceDetail', title: '공지 수정' }]);

    await sendFromWeb(createHandlers(stack, '러닝크루'), 'shell.replace', '/crews/3/announce/7');

    expect(stack.current().title).toBe('공지사항');
    expect(stack.current().announceId).toBe(7);

    stack.goBack();

    expect(stack.current().screen).toBe('AnnounceList');
  });

  it('알 수 없는 경로로 교체하려 하면 지금 화면을 그대로 두고 웹에 실패를 알린다', async () => {
    const stack = createStack([{ screen: 'AnnounceList' }, { screen: 'AnnounceDetail', title: '공지 작성' }]);

    const response = await sendFromWeb(createHandlers(stack, '러닝크루'), 'shell.replace', '/crews/3/schedule');

    expect(stack.current().title).toBe('공지 작성');
    expect(response?.error).toBeDefined();
  });
});
