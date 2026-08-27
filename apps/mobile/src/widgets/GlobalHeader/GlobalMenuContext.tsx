import { type ReactNode, createContext, useContext, useMemo, useState } from 'react';

interface GlobalMenuValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const GlobalMenuContext = createContext<GlobalMenuValue | null>(null);

/**
 * 드로어의 열림 상태를 헤더 밖으로 꺼내 둔다.
 *
 * **왜 상태를 굳이 올렸나** — 드로어 패널은 앱 헤더 바로 아래에서 시작해야 하는데,
 * 그 높이는 우리가 정하는 게 아니라 네이티브 스택이 정한다(`HeaderHeightContext`).
 * 그런데 그 컨텍스트는 **화면 콘텐츠에만** 깔리고 헤더 슬롯에는 닿지 않는다.
 * 시트를 헤더 안(`headerTitle`)에서 그리는 한 실제 높이를 알 방법이 없어
 * 상수로 근사할 수밖에 없었고, 그 상수는 기기마다 틀렸다 —
 * iPhone 16 Pro 는 safe-area 62 + 38, 14 Pro 는 59 + 39, SE 는 20 + 44 다(실측·계산).
 *
 * 그래서 **여는 버튼은 헤더에, 그려지는 시트는 화면에** 두고 이 컨텍스트로 잇는다.
 */
export function GlobalMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return <GlobalMenuContext.Provider value={value}>{children}</GlobalMenuContext.Provider>;
}

export function useGlobalMenu() {
  const value = useContext(GlobalMenuContext);

  if (!value) {
    throw new Error('useGlobalMenu 는 GlobalMenuProvider 안에서만 쓸 수 있다.');
  }

  return value;
}
