/**
 * Phase 1.5 스파이크 — 웹뷰 셸 대신 RN 네비게이터를 띄운다.
 *
 * 원래 웹뷰 셸은 git 이력에 있다(`git show HEAD~N:apps/mobile/App.tsx`).
 * 스파이크가 끝나면 되돌리거나, 웹뷰를 스택의 한 화면으로 넣는다(Phase 4).
 */
import { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { QueryClientProvider } from '@tanstack/react-query';

import './global.css';
import { AuthProvider } from './src/auth/AuthProvider';
import { initShellSession } from './src/auth/session';
import { RootNavigator } from './src/navigation/RootNavigator';
import { queryClient } from './src/query/queryClient';

// 셸이 세션을 쥔다. 요청이 나가기 전에 등록돼야 하므로 모듈 로드 시점에 부른다.
initShellSession();

function App() {
  useEffect(() => {
    void BootSplash.hide({ fade: true });
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* AuthProvider 가 queryClient.clear() 를 부르므로 QueryClientProvider 안쪽이어야 한다. */}
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
