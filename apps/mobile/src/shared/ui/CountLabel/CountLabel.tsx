import { View } from 'react-native';

import { Text } from '../Text';

/** 웹 `shared/ui/CountLabel` 의 RN 미러. */
export function CountLabel({ count }: { count: number }) {
  return (
    <View className="rounded-full bg-primary50 px-[3.5px] py-[1.5px]">
      <Text.xs className="text-primary700">{count}</Text.xs>
    </View>
  );
}
