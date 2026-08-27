import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';

import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import type { RootStackParamList } from '../navigation/types';
import { toast } from '../shared/ui/Toast';

/** 두 번째 뒤로가기를 "종료 의사"로 인정하는 시간. */
const EXIT_WINDOW_MS = 2000;

/**
 * 안드로이드 루트 화면에서 실수로 앱이 종료되는 것을 막는다.
 *
 * 안드로이드는 "루트에서 뒤로가기 = 앱 종료"가 플랫폼 관례다(iOS 는 아무 일도 없다).
 * 관례 자체는 지키되, 한 번 더 확인을 받아 오터치로 나가는 것만 막는다.
 *
 * **중첩 화면에서는 관여하지 않는다.** 뒤로 갈 곳이 남아 있으면 false 를 돌려
 * 네이티브 스택이 평소대로 pop 하게 둔다 — 여기서 true 를 돌리면 뒤로가기가 통째로 막힌다.
 *
 * 제스처와 하드웨어 버튼 양쪽 모두 이 경로로 온다.
 * (AndroidManifest 의 `enableOnBackInvokedCallback="false"` 가 제스처를 레거시 경로로 보낸다)
 */
export const useAndroidExitConfirm = (navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>) => {
  const lastPressedAtRef = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const onBackPress = () => {
      // 뒤로 갈 화면이 남아 있으면 우리 일이 아니다.
      if (navigationRef.isReady() && navigationRef.canGoBack()) {
        return false;
      }

      const now = Date.now();

      // 두 번째 — 기본 동작(앱 종료)에 맡긴다.
      if (now - lastPressedAtRef.current < EXIT_WINDOW_MS) {
        return false;
      }

      lastPressedAtRef.current = now;
      toast('한 번 더 누르면 종료됩니다.');

      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  }, [navigationRef]);
};
