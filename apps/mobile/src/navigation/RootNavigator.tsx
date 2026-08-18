import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAndroidExitConfirm } from '../hooks/useAndroidExitConfirm';
import { GlobalHeader } from '../widgets/GlobalHeader';
import { CrewDetailScreen } from '../screens/CrewDetailScreen';
import { CrewHomeScreen } from '../screens/CrewHomeScreen';
import { CrewNewScreen } from '../screens/CrewNewScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { appHeaderOptions } from '../shared/ui/AppHeader';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * 탭 화면 헤더 — 웹 `widgets/GlobalHeader` 를 그대로 옮겼다.
 *
 * 로고 · 알림 벨 · 햄버거 드로어까지 웹과 같다. 4b 로 인증이 붙어 조건이 갖춰졌다.
 * 웹은 탭이 달라도 헤더가 하나라, 여기서도 탭별 제목을 두지 않는다.
 */

export function RootNavigator() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useAndroidExitConfirm(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{
            // 헤더 전체를 웹 GlobalHeader 로 채운다 — 제목 슬롯만으로는 로고·햄버거를 담을 수 없다.
            headerTitle: () => <GlobalHeader onLoginPress={() => navigationRef.navigate('Login')} />,
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerShadowVisible: true,
            // 헤더 폭을 다 쓰려면 좌우 슬롯을 비워야 한다. 탭 화면은 뒤로 갈 곳도 없다.
            headerLeft: () => null,
            headerRight: () => null,
          }}
        />
        <Stack.Screen
          name="CrewDetail"
          component={CrewDetailScreen}
          // 목록에서 넘긴 이름을 헤더에 쓴다 — 상세 응답을 기다리지 않고 즉시 보인다.
          options={({ route }) => appHeaderOptions({ title: route.params.crewName })}
        />
        <Stack.Screen
          name="CrewHome"
          component={CrewHomeScreen}
          // 상세에서 넘긴 이름을 헤더에 쓴다 — 홈 응답을 기다리지 않고 즉시 보인다.
          options={({ route }) => appHeaderOptions({ title: route.params.crewName })}
        />
        <Stack.Screen name="CrewNew" component={CrewNewScreen} options={appHeaderOptions({ title: '크루 개설' })} />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          // 웹은 `/login` 이 **전체 페이지**다. modal 로 두면 안드로이드에서 이전 화면이
          // 뒤에 비쳐 보인다(실측). 웹과 같게 평범한 push 로 둔다.
          options={appHeaderOptions({ title: '로그인' })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
