import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../Text';

interface BottomSheetProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외).
const CLOSE_ICON_SIZE = 16;

const CLOSE_ICON_COLOR = '#000000';

/** 웹 vaul Drawer 의 열기/닫기 시간에 대응한다. */
const OPEN_DURATION_MS = 300;

const CLOSE_DURATION_MS = 200;

/**
 * 웹 `shared/ui/BottomSheet` 의 RN 미러.
 *
 * 웹은 vaul `Drawer` 를 쓰지만 RN 대응물이 없어 내장 `Modal` 로 만든다.
 *
 * **`animationType="slide"` 를 쓰지 않는다.** 그건 배경 오버레이까지 통째로 밀어올려
 * 어두운 막이 시트와 함께 올라온다(실측). 웹은 **막은 제자리에서 서서히 어두워지고
 * 시트만 올라온다.** 그래서 둘을 따로 애니메이션한다 —
 * 막은 `opacity`, 시트는 `translateY`. RN 내장 `Animated` 라 reanimated 가 필요 없다.
 *
 * 닫을 때는 애니메이션이 끝난 뒤에 Modal 을 내린다. 바로 내리면 튕기듯 사라진다.
 */
export function BottomSheet({ title, isOpen, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const [isMounted, setIsMounted] = useState(isOpen);
  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: OPEN_DURATION_MS, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: OPEN_DURATION_MS, useNativeDriver: true }),
      ]).start();

      return;
    }

    Animated.parallel([
      Animated.timing(translateY, { toValue: height, duration: CLOSE_DURATION_MS, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: CLOSE_DURATION_MS, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  }, [isOpen, height, translateY, backdropOpacity]);

  return (
    <Modal visible={isMounted} animationType="none" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* 막은 제자리에서 어두워진다 — 시트와 함께 움직이지 않는다.
            `absolute inset-0` 대신 `StyleSheet.absoluteFill` 을 쓴다 —
            NativeWind 의 inset 유틸은 조용히 무시될 수 있고, 그러면 막이 아예 안 그려진다. */}
        <Animated.View
          className="bg-black/40"
          style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          className="max-h-[85%] rounded-t-2xl bg-white"
          style={{ paddingBottom: insets.bottom, transform: [{ translateY }] }}
        >
          <View className="mt-2 flex-row items-center justify-between px-4 py-4">
            <Text.xl className="font-medium">{title}</Text.xl>
            <Pressable className="px-2" onPress={onClose} hitSlop={8}>
              <X size={CLOSE_ICON_SIZE} color={CLOSE_ICON_COLOR} />
            </Pressable>
          </View>

          <View className="p-4">{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}
