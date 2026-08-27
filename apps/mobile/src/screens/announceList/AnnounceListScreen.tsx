import { ErrorHandlingWrapper } from '../../widgets/ErrorBoundary';
import { ErrorFallback } from '../../widgets/ErrorFallback';
import { ScreenLoading } from '../../shared/ui/ScreenState';
import { AnnounceListContent, type AnnounceListContentProps } from './AnnounceListContent';

/**
 * 크루 공지 목록 화면의 **경계**. 도메인 fetch 의 대기·실패를 이 화면 안에서만 처리한다.
 */
export function AnnounceListScreen(props: AnnounceListContentProps) {
  return (
    <ErrorHandlingWrapper fallbackComponent={ErrorFallback} suspenseFallback={<ScreenLoading />}>
      <AnnounceListContent {...props} />
    </ErrorHandlingWrapper>
  );
}
