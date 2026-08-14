import { useState } from 'react';

/**
 * iOS 엣지 스와이프 뒤로가기(allowsBackForwardNavigationGestures) 활성 여부를 관리한다.
 * 당근 방식: back 버튼 헤더가 있는 화면에서만 켠다.
 *
 * 지금은 브릿지 계약(`shell.setBackGesture`)으로 온다 — `setBackGestureEnabled` 가 그 경로다.
 * `handleMessage` 는 계약 이전 평문(`NATIVE_BACK:on|off`)을 쓰는 **구버전 웹**용이다.
 * 웹 캐시에 옛 번들이 남아 있을 수 있어 지우지 않는다.
 */
export const useBackGesture = () => {
  const [backGestureEnabled, setBackGestureEnabled] = useState(false);

  const handleMessage = (data: string) => {
    if (data === 'NATIVE_BACK:on') {
      setBackGestureEnabled(true);

      return;
    }

    if (data === 'NATIVE_BACK:off') {
      setBackGestureEnabled(false);
    }
  };

  return { backGestureEnabled, setBackGestureEnabled, handleMessage };
};
