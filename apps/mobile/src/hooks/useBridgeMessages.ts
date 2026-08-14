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
      };

      const consumed = handleWebMessage(data, handlers, (script) => webRef.current?.injectJavaScript(script));

      if (!consumed) {
        onLegacyMessage(data);
      }
    },
    [webRef, onReady, onBackGestureChange, onLegacyMessage],
  );
