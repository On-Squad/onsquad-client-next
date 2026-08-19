import { View } from 'react-native';

import { isTokenExpiredError } from '../../shared/lib/auth/isTokenExpiredError';
import type { FallbackProps } from '../../shared/types/error';
import { Button } from '../../shared/ui/Button';
import { Text } from '../../shared/ui/Text';

const DEFAULT_MESSAGE = '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';

/**
 * 웹 `widgets/ErrorFallback` 의 RN 대응물.
 *
 * 웹은 overlay-kit 으로 알럿을 띄우지만 RN 은 **화면 자리를 그대로 채운다** —
 * 경계가 화면 단위라 그 자리에 그리는 편이 자연스럽고, 알럿을 닫으면 빈 화면만 남는 문제도 없다.
 *
 * **토큰 만료는 여기서 다루지 않는다.** `queryClient` 의 QueryCache.onError 가
 * 중앙에서 로그아웃 처리하므로, 만료일 때는 일반 에러 문구를 띄우지 않는다(웹과 같은 게이트).
 */
export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  if (isTokenExpiredError(error)) {
    return <View className="flex-1 bg-white" />;
  }

  const message = error?.message?.trim() ? error.message : DEFAULT_MESSAGE;

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-white px-8">
      <Text.base className="text-center text-grayscale600">{message}</Text.base>

      {/* 다시 시도: ErrorBoundary 초기화 → Suspense 가 자식을 재마운트하며 쿼리를 재실행한다. */}
      <Button onPress={resetErrorBoundary}>
        <Text.base className="font-semibold text-white">다시 시도</Text.base>
      </Button>
    </View>
  );
}
