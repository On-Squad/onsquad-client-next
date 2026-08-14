'use client';

import { useEffect, useRef } from 'react';

import { CircleX } from 'lucide-react';

import { TOAST } from '@/shared/config/toast';
import { useToast } from '@/shared/lib/hooks/useToast';
import { setMutationErrorPresenter } from '@/shared/lib/queries';

/**
 * mutation 실패를 웹에서 어떻게 보여줄지 등록한다.
 *
 * `useApiMutation` 은 "실패했다"는 사실만 넘기고, 표시 방법은 여기서 정한다.
 * 그래야 데이터 레이어가 lucide-react·radix 토스트를 끌고 다니지 않는다.
 * (RN 은 같은 자리에 자기 구현을 등록한다)
 */
export function MutationErrorProvider() {
  const { toast, hide } = useToast();

  // useToast 는 매 렌더 새 함수를 준다. ref 로 최신 것을 가리키게 해서 등록은 한 번만 한다.
  const toastRef = useRef({ toast, hide });
  toastRef.current = { toast, hide };

  useEffect(() => {
    setMutationErrorPresenter((error) => {
      toastRef.current.toast({
        title: error.message,
        className: TOAST.error,
        icon: <CircleX onClick={() => toastRef.current.hide()} />,
      });
    });
  }, []);

  return null;
}
