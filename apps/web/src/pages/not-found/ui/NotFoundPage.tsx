import { NotFound } from '@/widgets/NotFound';

// 레이아웃(WithTabLayout)은 app 레이어 소유라 여기서 import 하지 않는다.
// 라우트(app/not-found.tsx)가 조합한다 — pages 가 app 을 참조하면 의존 방향이 뒤집힌다.
const NotFoundPage = () => {
  return <NotFound />;
};

export default NotFoundPage;
