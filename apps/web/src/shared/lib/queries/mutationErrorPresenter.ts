/**
 * mutation 실패를 사용자에게 어떻게 보여줄지 주입받는다.
 *
 * `useApiMutation` 은 앱의 거의 모든 변경 요청이 거쳐가는 길목이다.
 * 여기에 토스트 UI 를 직접 박아두면 **데이터 레이어가 웹 UI 를 끌고 다니게 된다** —
 * RN 으로 이 훅을 가져갈 때 lucide-react 와 radix 토스트가 통째로 따라온다.
 *
 * 그래서 "무엇을 보여줄지"는 플랫폼이 정하고, 여기서는 "실패했다"는 사실만 넘긴다.
 * 웹은 부팅 시 토스트 구현을 등록하고(`MutationErrorProvider`), RN 은 자기 구현을 등록한다.
 */
export type MutationErrorPresenter = (error: Error) => void;

/** 등록 전에는 아무것도 하지 않는다 — 표시가 없다고 요청이 실패하면 안 된다. */
let present: MutationErrorPresenter = () => {};

export const setMutationErrorPresenter = (presenter: MutationErrorPresenter) => {
  present = presenter;
};

export const presentMutationError = (error: Error) => {
  try {
    present(error);
  } catch {
    // 에러를 알리다가 또 던지면 원래 에러가 묻힌다.
  }
};
