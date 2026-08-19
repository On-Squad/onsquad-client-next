import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { cn } from '../../lib/utils';
import { Text } from '../Text';

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** 없으면 "확인" 버튼 하나. 웹과 같다. */
  buttonSlot?: ReactNode;
}

/**
 * 웹 `shared/ui/Alert` 의 RN 미러.
 *
 * 웹은 shadcn `AlertDialog`(Radix) 를 쓰지만 RN 대응물이 없어 내장 `Modal` 로 만든다.
 * 구조와 클래스는 웹을 그대로 따른다 —
 * 헤더 `px-4 pt-9` + 가운데 `text-xl`, 본문 `px-4 pb-4` 가운데 정렬, 푸터는 모서리에 붙는 버튼.
 *
 * **RN `Alert.alert` 를 쓰지 않는다.** 그건 OS 기본 대화상자라 웹과 전혀 다르게 보인다.
 */
export function Alert({ isOpen, onClose, title, children, buttonSlot }: AlertProps) {
  return (
    <Modal visible={isOpen} animationType="fade" transparent onRequestClose={onClose}>
      {/* 바깥을 눌러도 닫히지 않는다 — 웹 AlertDialog 와 같다(선택을 강제한다) */}
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View className="w-full max-w-sm overflow-hidden rounded-md bg-white">
          <View className="px-4 pt-9">
            <Text.xl className="text-center text-grayscale900">{title || '알림'}</Text.xl>
          </View>

          <View className="items-center px-4 pb-4 pt-4">{children}</View>

          <View className="w-full">
            {buttonSlot ?? (
              <Pressable className="h-14 w-full items-center justify-center bg-primary500" onPress={onClose}>
                <Text.lg className="text-white">확인</Text.lg>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * 웹 `shared/ui/Alert/style.ts` 의 BUTTON 상수 대응.
 *
 * 웹은 `pt-6 pb-5` 지만 shadcn Button 의 base 가 **`h-10`(40px)로 높이를 고정**해
 * 실제로는 그만큼 커지지 않는다. RN 에는 그 base 가 없어 패딩만 그대로 옮기면
 * 버튼이 훨씬 뚱뚱해진다(실측) — 그래서 **높이를 고정하고 가운데 정렬**한다.
 */
export const ALERT_BUTTON = {
  ACTION: 'h-14 flex-1 items-center justify-center bg-primary500',
  CANCEL: 'h-14 flex-1 items-center justify-center bg-grayscale100',
} as const;

export const alertButtonText = (kind: 'action' | 'cancel') =>
  cn('text-lg', kind === 'action' ? 'text-white' : 'text-grayscale600');
