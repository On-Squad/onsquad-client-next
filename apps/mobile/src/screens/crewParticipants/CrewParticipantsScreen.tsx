import { ScreenLoading } from '../../shared/ui/ScreenState';
import { ErrorHandlingWrapper } from '../../widgets/ErrorBoundary';
import { ErrorFallback } from '../../widgets/ErrorFallback';

import { CrewParticipantsContent, type CrewParticipantsContentProps } from './CrewParticipantsContent';

/** 참가 신청자 목록의 **경계**. */
export function CrewParticipantsScreen(props: CrewParticipantsContentProps) {
  return (
    <ErrorHandlingWrapper fallbackComponent={ErrorFallback} suspenseFallback={<ScreenLoading />}>
      <CrewParticipantsContent {...props} />
    </ErrorHandlingWrapper>
  );
}
