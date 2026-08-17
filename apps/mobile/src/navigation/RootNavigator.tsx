import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';

import { CrewDetailScreen } from '../screens/CrewDetailScreen';
import { CrewListScreen } from '../screens/CrewListScreen';
import { CrewNewScreen } from '../screens/CrewNewScreen';
import { appHeaderOptions } from '../shared/ui/AppHeader';
import { Text } from '../shared/ui/Text';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="CrewList"
          component={CrewListScreen}
          options={({ navigation }) =>
            appHeaderOptions({
              title: '크루 탐색',
              headerRight: () => (
                <Pressable onPress={() => navigation.navigate('CrewNew')} hitSlop={8}>
                  {/* 원래 text-75(10px) 였다. Text.xxs 가 0.65rem(10.4px) 로 가장 가깝다 —
                      웹에 대응물이 없는 RN 전용 요소라 크기를 바꾸지 않는다. */}
                  <Text.xxs className="font-semibold text-primary500">개설</Text.xxs>
                </Pressable>
              ),
            })
          }
        />
        <Stack.Screen
          name="CrewDetail"
          component={CrewDetailScreen}
          // 목록에서 넘긴 이름을 헤더에 쓴다 — 상세 응답을 기다리지 않고 즉시 보인다.
          options={({ route }) => appHeaderOptions({ title: route.params.crewName })}
        />
        <Stack.Screen name="CrewNew" component={CrewNewScreen} options={appHeaderOptions({ title: '크루 개설' })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
