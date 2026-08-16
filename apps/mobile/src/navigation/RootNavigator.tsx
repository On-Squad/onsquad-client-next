import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import { CrewListScreen } from '../screens/CrewListScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Task 5 에서 실제 화면으로 교체한다.
function CrewDetailPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-75">상세 화면 준비 중</Text>
    </View>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="CrewList" component={CrewListScreen} options={{ title: '크루 탐색' }} />
        <Stack.Screen name="CrewDetail" component={CrewDetailPlaceholder} options={{ title: '크루' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
