import { ActivityIndicator, Pressable, Text, View } from 'react-native';

/**
 * 화면 전체를 채우는 로딩·에러 상태.
 *
 * `ActivityIndicator` 의 color 만 hex 리터럴인 이유는 RN 내장 컴포넌트라 className 이 먹지 않아서다.
 * 이런 예외가 몇 개나 나오는지도 스파이크의 측정 대상이다 — 토큰 재사용률의 실질을 보여준다.
 */
const PRIMARY_500 = '#FF7800';

export function ScreenLoading() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color={PRIMARY_500} />
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
