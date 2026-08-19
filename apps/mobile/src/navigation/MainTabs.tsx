import { useState } from 'react';

import { Home, Search } from 'lucide-react-native';

import {
  type BottomTabBarButtonProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../auth/AuthProvider';
import { CrewListScreen } from '../screens/crewList';
import { HomeScreen } from '../screens/home';
import { LoginAlert } from '../shared/ui/LoginAlert';
import { CrewNewTabButton } from './CrewNewTabButton';
import type { MainTabParamList, RootStackParamList } from './types';

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외).
// 웹 BottomTab 의 text-primary / text-gray-400 에 대응한다.
const TAB_ACTIVE_COLOR = '#FF7800';
const TAB_INACTIVE_COLOR = '#9CA3AF';

const ICON_SIZE = 20;

const Tab = createBottomTabNavigator<MainTabParamList>();

/** 도달하지 않는 화면. tabPress 를 preventDefault 로 막고 루트 스택으로 보낸다. */
function CrewNewTabPlaceholder() {
  return null;
}

// 아래 셋은 렌더 중에 정의하지 않으려고 모듈 레벨로 뺐다.
// 인라인으로 두면 매 렌더마다 새 컴포넌트 타입이 되어 react/no-unstable-nested-components 가 경고한다.
const renderSearchIcon = ({ color }: { color: string }) => (
  <Search color={color} size={ICON_SIZE} />
);

const renderHomeIcon = ({ color }: { color: string }) => (
  <Home color={color} size={ICON_SIZE} />
);

const renderCrewNewTabButton = (props: BottomTabBarButtonProps) => (
  <CrewNewTabButton {...props} />
);

/**
 * 웹 `(with-tab)` 라우트 그룹의 RN 대응물.
 *
 * `headerShown: false` 는 헤더를 없애는 게 아니라 **루트 스택이 그린다**는 뜻이다.
 * 탭이 자기 헤더를 그리면 native-stack 용과 bottom-tabs 용 설정이 두 벌이 되고 타입도 다르다.
 *
 * 탭 순서는 웹 BottomTab 과 같다 — 크루 탐색 · (개설 버튼) · 홈.
 * 초기 선택은 홈이다. 웹에서 `/` 가 진입점이기 때문이다.
 */
export function MainTabs() {
  // MainTabs 는 AuthProvider 안쪽이라 훅을 쓸 수 있다.
  // listeners 콜백이 이 **값**을 닫는다 — 렌더 중 컴포넌트를 정의하는 것과는 다르다.
  const { isAuthenticated } = useAuth();
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);
  // 탭 안에서 루트 스택으로 가려면 부모 내비게이터를 잡아야 한다.
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        // 기본값 'firstRoute' 는 **선언 순서상 첫 화면**(크루 탐색)으로 되돌린다.
        // 우리 초기 탭은 홈이라 둘이 어긋나 탭 사이를 핑퐁한다(에뮬레이터 실측).
        // 'initialRoute' 로 두면 어느 탭에서든 뒤로가기가 홈으로 모이고,
        // 홈에서 한 번 더 누르면 useAndroidExitConfirm 이 받아 종료 확인을 띄운다.
        backBehavior="initialRoute"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: TAB_ACTIVE_COLOR,
          tabBarInactiveTintColor: TAB_INACTIVE_COLOR,
        }}
      >
        <Tab.Screen
          name="Community"
          component={CrewListScreen}
          options={{
            title: '크루 탐색',
            tabBarIcon: renderSearchIcon,
          }}
        />

        <Tab.Screen
          name="CrewNewTab"
          component={CrewNewTabPlaceholder}
          options={{ tabBarButton: renderCrewNewTabButton }}
          listeners={({ navigation }) => ({
            tabPress: event => {
              // 탭 전환을 막는다. 비로그인이면 웹 BottomTab 과 같이 LoginAlert 를 띄운다 —
              // 곧장 로그인 화면으로 보내지 않는다.
              event.preventDefault();

              if (!isAuthenticated) {
                setIsLoginAlertOpen(true);

                return;
              }

              navigation.getParent()?.navigate('CrewNew');
            },
          })}
        />

        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '홈',
            tabBarIcon: renderHomeIcon,
          }}
        />
      </Tab.Navigator>

      <LoginAlert
        isOpen={isLoginAlertOpen}
        onClose={() => setIsLoginAlertOpen(false)}
        onLoginPress={() => {
          setIsLoginAlertOpen(false);
          rootNavigation.navigate('Login');
        }}
      />
    </>
  );
}
