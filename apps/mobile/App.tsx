/**
 * Phase 1.5 스파이크 — 웹뷰 셸 대신 RN 네비게이터를 띄운다.
 *
 * 원래 웹뷰 셸은 git 이력에 있다(`git show HEAD~N:apps/mobile/App.tsx`).
 * 스파이크가 끝나면 되돌리거나, 웹뷰를 스택의 한 화면으로 넣는다(Phase 4).
 */
import { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QueryClientProvider } from '@tanstack/react-query';

import './global.css';
import { AuthProvider } from './src/auth/AuthProvider';
import { initShellSession } from './src/auth/session';
import { setMutationErrorPresenter } from './src/shared/lib/queries/mutationErrorPresenter';
import { RootNavigator } from './src/navigation/RootNavigator';
import { queryClient } from './src/query/queryClient';
import { ScreenLoading } from './src/shared/ui/ScreenState';
import { Toaster, toast } from './src/shared/ui/Toast';
import { ErrorHandlingWrapper } from './src/widgets/ErrorBoundary';
import { ErrorFallback } from './src/widgets/ErrorFallback';

// 셸이 세션을 쥔다. 요청이 나가기 전에 등록돼야 하므로 모듈 로드 시점에 부른다.
initShellSession();

// 변경 요청이 실패했을 때 **무엇을 보여줄지는 셸이 정한다.**
// 데이터 레이어(useApiMutation)는 "실패했다"는 사실만 넘긴다 — 그 덕분에
// 웹의 훅을 그대로 옮겨와도 radix 토스트가 따라오지 않는다.
// 첫 mutation 이 조용히 실패하지 않도록 모듈 로드 시점에 등록한다.
setMutationErrorPresenter(error => toast(error.message));

function App() {
  useEffect(() => {
    void BootSplash.hide({ fade: true });
  }, []);

  return (
    // GestureHandlerRootView 가 가장 바깥이어야 한다 — Android 에서 제스처가 여기서부터 전달된다.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/* AuthProvider 가 queryClient.clear() 를 부르므로 QueryClientProvider 안쪽이어야 한다. */}
          <AuthProvider>
            {/*
            **루트 경계** — 화면별 경계를 빠져나온 에러를 여기서 받는다.
            화면 안에서 처리되는 것은 각 screens/{도메인}/ 의 경계가 맡고,
            내비게이터·프로바이더 등 그 바깥에서 터진 것만 여기까지 온다.
          */}
            <ErrorHandlingWrapper
              fallbackComponent={ErrorFallback}
              suspenseFallback={<ScreenLoading />}
            >
              <RootNavigator />
            </ErrorHandlingWrapper>

            {/*
            경계 **밖**이자 트리의 마지막이다 — 에러 폴백이 떠 있을 때도 토스트는 살아 있어야 하고,
            마지막에 그려져야 내비게이터·모달 위에 올라온다(웹 `z-50` 대응).
          */}
            <Toaster />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
