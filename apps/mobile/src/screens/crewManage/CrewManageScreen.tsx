import { ScreenLoading } from '../../shared/ui/ScreenState';
import { ErrorHandlingWrapper } from '../../widgets/ErrorBoundary';
import { ErrorFallback } from '../../widgets/ErrorFallback';

import { CrewManageContent, type CrewManageContentProps } from './CrewManageContent';

/** 크루 관리 허브의 **경계**. 화면 자체는 `CrewManageContent` 가 그린다. */
export function CrewManageScreen(props: CrewManageContentProps) {
  return (
    <ErrorHandlingWrapper fallbackComponent={ErrorFallback} suspenseFallback={<ScreenLoading />}>
      <CrewManageContent {...props} />
    </ErrorHandlingWrapper>
  );
}
