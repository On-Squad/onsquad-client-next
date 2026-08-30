import { useCallback, type ComponentRef, type RefObject } from 'react';

import type { BridgeRequest } from '@onsquad/bridge';
import { handleWebMessage, type BridgeHandlers } from '@onsquad/bridge/native';
import type { WebView } from 'react-native-webview';

interface UseBridgeMessagesParams {
  webRef: RefObject<ComponentRef<typeof WebView> | null>;
  onReady: () => void;
  onBackGestureChange: (enabled: boolean) => void;
  /** 브릿지 봉투가 아닌 평문 메시지(구버전 웹)를 넘길 곳. */
  onLegacyMessage: (data: string) => void;
  /**
   * shell.push 요청. 웹이 네이티브 스택에 새 화면을 쌓아달라고 요청한다.
   * 경로가 알려진 화면에 매핑되지 않으면 false 를 반환해 오류 응답을 보낸다.
   */
  onShellPush: (path: string) => boolean;
  /**
   * shell.replace 요청. 현재 WebView 화면을 스택에 쌓지 않고 교체한다.
   * 경로가 알려진 화면에 매핑되지 않으면 false 를 반환해 오류 응답을 보낸다.
   */
  onShellReplace: (path: string) => boolean;
  /**
   * auth.getToken — 앱이 보관 중인 수명 짧은 액세스 토큰을 돌려준다.
   * 만료된 토큰을 다시 물어오면 갱신이 필요해 비동기다. 던지면 브릿지가 실패 응답을 보낸다.
   */
  onAuthGetToken: () => Promise<{ accessToken: string; expiresAt: number }>;
  /** shell.contentReady — 웹이 그릴 내용을 다 받았다. 셸이 스켈레톤을 내린다. */
  onContentReady: () => void;
  /** ui.toast — 웹 대신 셸이 토스트를 띄운다. 웹뷰 화면만 생김새가 달라지지 않게 한다. */
  onToast: (message: string) => void;
  /** media.pickImage — 고정 더미 URI 를 돌려준다(실제 피커·권한 없음). */
  onMediaPickImage: (max: number) => { uris: string[] };
}

/**
 * 웹 → 네이티브 메시지를 라우팅한다.
 *
 * 한 채널에 두 세대가 흐른다 — 브릿지 봉투(JSON)와 계약 이전 평문.
 * 웹 캐시에 옛 번들이 남아 있을 수 있어 평문 경로를 **지울 수 없다.**
 * 봉투로 해석되면 브릿지가 소비하고, 아니면 레거시로 흘린다.
 */
export const useBridgeMessages = ({
  webRef,
  onReady,
  onBackGestureChange,
  onLegacyMessage,
  onShellPush,
  onShellReplace,
  onAuthGetToken,
  onContentReady,
  onToast,
  onMediaPickImage,
}: UseBridgeMessagesParams) =>
  useCallback(
    (data: string) => {
      const handlers: BridgeHandlers = {
        'shell.ready': () => onReady(),
        'shell.setBackGesture': (req) => {
          // 와이어로 들어온 값이라 신뢰할 수 없다. 한 번만 단언하고 즉시 좁힌다.
          const { enabled } = req as BridgeRequest<'shell.setBackGesture'>;

          onBackGestureChange(Boolean(enabled));
        },
        'shell.push': (req) => {
          const { path } = req as BridgeRequest<'shell.push'>;
          const ok = onShellPush(String(path));

          if (!ok) {
            throw new Error(`알 수 없는 경로: ${path}`);
          }
        },
        'shell.replace': (req) => {
          const { path } = req as BridgeRequest<'shell.replace'>;
          const ok = onShellReplace(String(path));

          if (!ok) {
            throw new Error(`알 수 없는 경로: ${path}`);
          }
        },
        'shell.contentReady': () => onContentReady(),
        'ui.toast': (req) => {
          const { message } = req as BridgeRequest<'ui.toast'>;

          onToast(message);
        },
        'auth.getToken': () => onAuthGetToken(),
        'media.pickImage': (req) => {
          const { max } = req as BridgeRequest<'media.pickImage'>;

          return onMediaPickImage(Number(max));
        },
      };

      const consumed = handleWebMessage(data, handlers, (script) => webRef.current?.injectJavaScript(script));

      if (!consumed) {
        onLegacyMessage(data);
      }
    },
    // eslint 규칙: 함수 ref 는 안정적이어서 deps 에 넣을 필요 없지만 콜백이 달라질 수 있다.
    [webRef, onReady, onBackGestureChange, onLegacyMessage, onShellPush, onShellReplace, onAuthGetToken, onContentReady, onToast, onMediaPickImage],
  );
