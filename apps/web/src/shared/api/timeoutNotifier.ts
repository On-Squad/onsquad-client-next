/**
 * 요청 타임아웃을 사용자에게 어떻게 알릴지 주입받는다.
 *
 * `common.ts` 는 앱의 모든 요청이 거쳐가는 길목이다.
 * 여기에 토스트 UI 를 직접 부르면 **데이터 레이어가 웹 UI 를 끌고 다니게 된다.**
 * 동적 import 로 숨기려 해도 소용없다 — **Metro 는 코드 스플리팅을 하지 않아
 * 동적 import 도 같은 번들에 적재한다.** (실측: RN 번들에 shadcn use-toast 가 들어왔다)
 *
 * 그래서 "무엇을 보여줄지"는 플랫폼이 정하고, 여기서는 "타임아웃됐다"는 사실만 넘긴다.
 * 웹은 부팅 시 토스트 구현을 등록하고(`TimeoutNotifierProvider`), RN 은 자기 구현을 등록한다.
 *
 * `mutationErrorPresenter` 와 같은 패턴이다.
 */
export type TimeoutNotifier = () => void;

/** 등록 전에는 아무것도 하지 않는다 — 안내가 없다고 요청 처리가 멈추면 안 된다. */
let notify: TimeoutNotifier = () => {};

export const setTimeoutNotifier = (notifier: TimeoutNotifier) => {
  notify = notifier;
};

export const notifyRequestTimeout = () => {
  try {
    notify();
  } catch {
    // 타임아웃을 알리다가 또 던지면 원래 타임아웃 에러가 묻힌다.
  }
};
