import { ErrorHandlingWrapper } from '../../widgets/ErrorBoundary';
import { ErrorFallback } from '../../widgets/ErrorFallback';
import { ScreenLoading } from '../../shared/ui/ScreenState';
import { CrewHomeContent, type CrewHomeContentProps } from './CrewHomeContent';

/**
 * 크루 홈의 **경계**. 화면 자체는 `CrewHomeContent` 가 그린다.
 *
 * 이 껍데기가 존재하는 이유는 하나다 — 도메인 fetch 의 대기·실패를
 * **그 화면 안에서만** 처리하기 위해서다. 루트 경계까지 올라가면 앱 전체가 폴백으로 덮인다.
 */
export function CrewHomeScreen(props: CrewHomeContentProps) {
  return (
    <ErrorHandlingWrapper fallbackComponent={ErrorFallback} suspenseFallback={<ScreenLoading />}>
      <CrewHomeContent {...props} />
    </ErrorHandlingWrapper>
  );
}
