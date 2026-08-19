import { ErrorHandlingWrapper } from '../../widgets/ErrorBoundary';
import { ErrorFallback } from '../../widgets/ErrorFallback';
import { ScreenLoading } from '../../shared/ui/ScreenState';
import { CrewDetailContent, type CrewDetailContentProps } from './CrewDetailContent';

/**
 * 크루 상세 의 **경계**. 화면 자체는 `CrewDetailContent` 가 그린다.
 *
 * 도메인 fetch 의 대기·실패를 **이 화면 안에서만** 처리한다.
 * 루트 경계까지 올라가면 앱 전체가 폴백으로 덮인다.
 */
export function CrewDetailScreen(props: CrewDetailContentProps) {
  return (
    <ErrorHandlingWrapper fallbackComponent={ErrorFallback} suspenseFallback={<ScreenLoading />}>
      <CrewDetailContent {...props} />
    </ErrorHandlingWrapper>
  );
}
