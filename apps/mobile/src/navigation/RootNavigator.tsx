import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CrewDetailScreen } from '../screens/CrewDetailScreen';
import { CrewListScreen } from '../screens/CrewListScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="CrewList" component={CrewListScreen} options={{ title: '크루 탐색' }} />
        <Stack.Screen
          name="CrewDetail"
          component={CrewDetailScreen}
          // 목록에서 넘긴 이름을 헤더에 쓴다 — 상세 응답을 기다리지 않고 즉시 보인다.
          options={({ route }) => ({ title: route.params.crewName })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
