import { WithTabLayout } from '@/app/layouts';

import { NotFoundPage } from '@/pages/not-found';

// 다른 라우트와 달리 re-export 가 아니다 —
// WithTabLayout 은 app 레이어 소유라 pages 가 참조할 수 없어, 조합을 여기서 한다.
export default function NotFound() {
  return (
    <WithTabLayout>
      <NotFoundPage />
    </WithTabLayout>
  );
}
