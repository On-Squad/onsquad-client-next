/**
 * Phase 1.5 Task 1 — 토큰 재사용 검증용 임시 화면.
 * Task 4 에서 네비게이터로 교체한다. 원래 웹뷰 셸은 git 이력에 있다.
 */
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

function App() {
  // 웹뷰 셸을 걷어내면서 스플래시를 내리는 주체가 사라졌다. 여기서 직접 내린다.
  useEffect(() => {
    void BootSplash.hide({ fade: true });
  }, []);

  return (
    <SafeAreaProvider>
      {/* 스플래시 배경도 주황이라 구분이 안 된다. 흰 배경 위에 색 블록을 얹어 판정한다. */}
      <View className="flex-1 items-center justify-center gap-s-30 bg-white">
        <View className="h-32 w-32 items-center justify-center rounded-2xl bg-primary500">
          <Text className="text-75 font-bold text-white">primary500</Text>
        </View>
        <Text className="text-100 font-bold">NativeWind 토큰 확인</Text>
      </View>
    </SafeAreaProvider>
  );
}

export default App;
