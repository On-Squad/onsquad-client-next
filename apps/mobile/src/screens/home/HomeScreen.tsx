import { ErrorHandlingWrapper } from '../../widgets/ErrorBoundary';
import { ErrorFallback } from '../../widgets/ErrorFallback';
import { ScreenLoading } from '../../shared/ui/ScreenState';
import { HomeContent, type HomeContentProps } from './HomeContent';

/**
 * 홈 의 **경계**. 화면 자체는 `HomeContent` 가 그린다.
 *
 * 도메인 fetch 의 대기·실패를 **이 화면 안에서만** 처리한다.
 * 루트 경계까지 올라가면 앱 전체가 폴백으로 덮인다.
 */
export function HomeScreen(props: HomeContentProps) {
  return (
    <ErrorHandlingWrapper fallbackComponent={ErrorFallback} suspenseFallback={<ScreenLoading />}>
      <HomeContent {...props} />
    </ErrorHandlingWrapper>
  );
}
