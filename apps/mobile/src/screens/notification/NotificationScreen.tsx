import { ErrorHandlingWrapper } from '../../widgets/ErrorBoundary';
import { ErrorFallback } from '../../widgets/ErrorFallback';
import { ScreenLoading } from '../../shared/ui/ScreenState';
import { NotificationContent, type NotificationContentProps } from './NotificationContent';

/**
 * 알림 화면의 **경계**. 도메인 fetch 의 대기·실패를 이 화면 안에서만 처리한다.
 */
export function NotificationScreen(props: NotificationContentProps) {
  return (
    <ErrorHandlingWrapper fallbackComponent={ErrorFallback} suspenseFallback={<ScreenLoading />}>
      <NotificationContent {...props} />
    </ErrorHandlingWrapper>
  );
}
