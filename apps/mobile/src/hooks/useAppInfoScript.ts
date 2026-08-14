import { useRef } from 'react';

import { buildAppInfoScript } from '../appInfo';

/**
 * 웹에 주입할 앱 정보 스크립트를 만든다.
 *
 * WebView 인스턴스 생성 시각을 첫 렌더 시점으로 고정한다 —
 * 리렌더마다 값이 바뀌면 `injectedJavaScriptBeforeContentLoaded` 가 계속 달라져
 * 계측 기준점이 흔들린다.
 */
export const useAppInfoScript = () => {
  const scriptRef = useRef<string | null>(null);

  if (scriptRef.current === null) {
    scriptRef.current = buildAppInfoScript(Date.now());
  }

  return scriptRef.current;
};
