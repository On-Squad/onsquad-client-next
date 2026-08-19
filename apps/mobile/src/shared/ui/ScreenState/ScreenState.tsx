import { Pressable, Text, View } from 'react-native';

import { Spinner } from '../Spinner';

/**
 * 화면 전체를 채우는 로딩·에러 상태.
 *
 * 로딩은 웹 RootLayout 의 suspenseFallback 과 같은 것을 쓴다 — `shared/ui/Spinner`.
 * **OS 기본 `ActivityIndicator` 를 쓰지 않는다.** 웹과 모양이 전혀 다르다.
 */

export function ScreenLoading() {
  return (
    <View className="flex-1 bg-white">
      <Spinner />
    </View>
  );
}

interface ScreenErrorProps {
  message: string;
  onRetry: () => void;
}

export function ScreenError({ message, onRetry }: ScreenErrorProps) {
  return (
    <View className="flex-1 items-center justify-center gap-s-30 bg-white px-s-40">
      <Text className="text-75 text-grayscale600">{message}</Text>
      <Pressable onPress={onRetry} className="rounded-lg bg-primary500 px-s-40 py-s-20">
        <Text className="text-75 font-semibold text-white">다시 시도</Text>
      </Pressable>
    </View>
  );
}
