'use client';

import { ReactElement, useRef } from 'react';

import type { LucideIcon } from 'lucide-react';

import { TOAST } from '@/shared/config/toast';
import { can, shellToast } from '@/shared/lib/bridge';
import { useToast as useLibToast } from '@/shared/ui/ui/use-toast';

export interface ToastMessageType {
  title: string;
  className: ValueOf<typeof TOAST>;
  icon?: LucideIcon | ReactElement<LucideIcon>;
}

const TOAST_TIMEOUT = 1500;

/**
 * @example
 *
 * ```tsx
 * toast({
 *    title: '합류 신청에 성공했습니다.',
 *    className: TOAST.primary,
 *    icon: <CircleX onClick={() => hide()} />,
 *  })
 * ```
 */
export const useToast = () => {
  const { toast, dismiss: libDismiss } = useLibToast();

  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = () => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }

    dismissTimeoutRef.current = setTimeout(() => {
      libDismiss();
    }, TOAST_TIMEOUT);
  };

  const show = ({ title, icon, className }: ToastMessageType) => {
    // **웹뷰에서는 셸이 띄운다.** 웹이 자기 토스트를 그리면 같은 앱 안에서
    // 웹뷰 화면만 생김새가 달라진다(실측). 브릿지가 없으면 아래 웹 토스트로 떨어진다.
    //
    // 아이콘은 넘기지 않는다 — 셸 토스트는 스스로 사라져 닫기 버튼이 필요 없다.
    if (can('ui.toast')) {
      shellToast(title);

      return;
    }

    toast({
      title,
      icon,
      className,
    });

    dismiss();
  };

  return { toast: show, hide: libDismiss };
};
