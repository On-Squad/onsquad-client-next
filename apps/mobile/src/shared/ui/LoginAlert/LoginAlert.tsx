import { Pressable, View } from 'react-native';

import { ALERT_BUTTON, Alert } from '../Alert';
import { Text } from '../Text';

interface LoginAlertProps {
  isOpen: boolean;
  onClose: () => void;
  /** "로그인" 을 누르면. 웹은 PATH.login 으로 이동한다. */
  onLoginPress: () => void;
}

/**
 * 웹 `shared/ui/LoginAlert` 의 RN 미러.
 *
 * **인증이 필요한 자리에서 곧장 로그인 화면으로 보내지 않는다.**
 * 웹은 이 알럿을 먼저 띄우고 사용자가 "로그인" 을 눌러야 이동한다 —
 * 문구·버튼 구성까지 웹과 같게 맞춘다.
 *
 * 회원가입은 아직 이관 전이라 모양만 두고 동작을 비운다(§7).
 */
export function LoginAlert({ isOpen, onClose, onLoginPress }: LoginAlertProps) {
  return (
    <Alert
      isOpen={isOpen}
      onClose={onClose}
      title="로그인이 필요한 서비스에요."
      buttonSlot={
        <View className="flex-row">
          <Pressable className={ALERT_BUTTON.CANCEL} onPress={onClose}>
            <Text.lg className="text-grayscale600">이전으로</Text.lg>
          </Pressable>
          <Pressable className={ALERT_BUTTON.ACTION} onPress={onLoginPress}>
            <Text.lg className="text-white">로그인</Text.lg>
          </Pressable>
        </View>
      }
    >
      <View className="flex-col items-center gap-2">
        <Text.lg className="font-semibold text-grayscale700">로그인 후 다시 시도해주세요.</Text.lg>

        <View className="flex-row items-center justify-center gap-2">
          <Text.sm className="text-grayscale700">아직 회원이 아니신가요?</Text.sm>
          {/* 회원가입 화면은 아직 이관 전이다 — 모양만 둔다 */}
          <Text.sm className="text-blue400 underline">회원가입</Text.sm>
        </View>
      </View>
    </Alert>
  );
}
