import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAndroidExitConfirm } from '../hooks/useAndroidExitConfirm';
import { CrewDetailScreen } from '../screens/CrewDetailScreen';
import { CrewHomeScreen } from '../screens/CrewHomeScreen';
import { CrewNewScreen } from '../screens/CrewNewScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { appHeaderOptions } from '../shared/ui/AppHeader';
import { MainTabs } from './MainTabs';
import type { MainTabParamList, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * 탭 화면의 헤더 제목.
 *
 * 웹은 탭 화면에서 GlobalHeader(로고 · 알림 벨 · 프로필 시트)를 쓰지만
 * 인증 · 알림 카운트 · Sheet 드로어를 끌고 온다. 지금은 제목만 둔다.
 */
const TAB_TITLES: Record<keyof MainTabParamList, string> = {
  Home: '온스쿼드',
  Community: '크루 탐색',
  CrewNewTab: '온스쿼드',
};

export function RootNavigator() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useAndroidExitConfirm(navigationRef);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={({ route }) => {
            // 초기 렌더에는 undefined 다 — 그때는 initialRouteName 인 Home 을 쓴다.
            const focused = (getFocusedRouteNameFromRoute(route) ?? 'Home') as keyof MainTabParamList;

            return appHeaderOptions({ title: TAB_TITLES[focused] });
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
          // 로그인은 흐름을 잠시 가로막는 것이지 이동이 아니다.
          // 아래로 내려 닫는 제스처도 네이티브가 준다.
          options={{ ...appHeaderOptions({ title: '로그인' }), presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
