/**
 * 화면 밖(= 컴포넌트 밖)에서도 부를 수 있는 명령형 토스트.
 *
 * 웹은 shadcn `use-toast` 의 모듈 스토어를 쓰고, 그 위에 `shared/lib/hooks/useToast` 가
 * 1.5초 뒤 자동 dismiss 를 얹는다. RN 도 같은 구조를 훨씬 작게 만든 것이다 —
 * 스토어(이 파일) + 호스트(`Toaster`).
 *
 * **RN 내장 `Alert.alert` 를 쓰지 않는다.** OS 기본 대화상자라 확인 버튼을 눌러야 사라지고,
 * 웹의 토스트와 생김새도 동작도 전혀 다르다.
 */

/** 웹 `useToast` 의 TOAST_TIMEOUT 과 같은 값. */
const TOAST_DURATION_MS = 1500;

type ToastListener = (message: string | null) => void;

/**
 * 호스트(`Toaster`)는 앱에 하나만 마운트되므로 리스너도 하나만 둔다.
 * 여러 개가 붙으면 마지막 것만 남아 토스트가 한 곳에서만 뜬다 — 의도한 것이다.
 */
let listener: ToastListener | null = null;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

export const subscribeToast = (next: ToastListener) => {
  listener = next;

  return () => {
    listener = null;
  };
};

/**
 * @example toast('가입 신청이 완료되었어요');
 */
export const toast = (message: string) => {
  listener?.(message);

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => listener?.(null), TOAST_DURATION_MS);
};
