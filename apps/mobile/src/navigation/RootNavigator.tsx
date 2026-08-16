import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';

import { CrewDetailScreen } from '../screens/CrewDetailScreen';
import { CrewListScreen } from '../screens/CrewListScreen';
import { CrewNewScreen } from '../screens/CrewNewScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="CrewList"
          component={CrewListScreen}
          options={({ navigation }) => ({
            title: '크루 탐색',
            headerRight: () => (
              <Pressable onPress={() => navigation.navigate('CrewNew')} hitSlop={8}>
                <Text className="text-75 font-semibold text-primary500">개설</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="CrewDetail"
          component={CrewDetailScreen}
          // 목록에서 넘긴 이름을 헤더에 쓴다 — 상세 응답을 기다리지 않고 즉시 보인다.
          options={({ route }) => ({ title: route.params.crewName })}
        />
        <Stack.Screen name="CrewNew" component={CrewNewScreen} options={{ title: '크루 개설' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
