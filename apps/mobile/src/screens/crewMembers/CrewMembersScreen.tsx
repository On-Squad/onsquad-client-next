import { ScreenLoading } from '../../shared/ui/ScreenState';
import { ErrorHandlingWrapper } from '../../widgets/ErrorBoundary';
import { ErrorFallback } from '../../widgets/ErrorFallback';

import { CrewMembersContent, type CrewMembersContentProps } from './CrewMembersContent';

/** 크루원 목록의 에러·로딩 경계. */
export function CrewMembersScreen(props: CrewMembersContentProps) {
  return (
    <ErrorHandlingWrapper fallbackComponent={ErrorFallback} suspenseFallback={<ScreenLoading />}>
      <CrewMembersContent {...props} />
    </ErrorHandlingWrapper>
  );
}
