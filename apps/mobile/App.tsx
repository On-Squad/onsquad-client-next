/**
 * Phase 1.5 Task 3 — 배선 검증용 임시 화면.
 * 화면을 만들기 전에 "RN 이 entities/crew 로 실제 백엔드와 통신되는가" 만 확인한다.
 * Task 4 에서 네비게이터로 교체한다.
 */
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { crewQueries } from '@/entities/crew';

import './global.css';
import { initShellSession } from './src/auth/session';

initShellSession();

function App() {
  const [status, setStatus] = useState('요청 중…');

  useEffect(() => {
    void BootSplash.hide({ fade: true });

    const options = crewQueries.list({ page: 1, size: 3 });

    Promise.resolve(options.queryFn?.({} as never))
      .then((data) => setStatus(`성공\n${JSON.stringify(data, null, 2).slice(0, 400)}`))
      .catch((error: unknown) => setStatus(`실패\n${String(error)}`));
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerClassName="p-s-30">
          <Text className="text-75">{status}</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
