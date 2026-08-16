import type { ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';

interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  /** 검증 실패 메시지. 있으면 테두리가 강조되고 아래에 문구가 붙는다. */
  error?: string;
  multiline?: boolean;
  /** 라벨 우측 슬롯. 크루명 중복확인 버튼 등이 들어간다. */
  rightSlot?: ReactNode;
}

/**
 * 웹의 `shared/ui/Input` · `Textarea` 에 대응하는 RN 조각.
 *
 * 웹은 FormProvider + useFormContext 로 name 만 넘기면 되지만,
 * RN 에서는 Controller 없이 값을 직접 주고받는 형태로 단순화했다(스파이크 범위).
 */
export function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  rightSlot,
}: FormFieldProps) {
  return (
    <View className="mb-s-30">
      <View className="mb-s-10 flex-row items-center justify-between">
        <Text className="text-75 font-semibold text-grayscale800">{label}</Text>
        {rightSlot}
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        // RN 내장이라 className 이 안 먹는 prop — 토큰 예외 1
        placeholderTextColor="#909090"
        className={[
          'rounded-lg border px-s-30 py-s-20 text-75 text-grayscale900',
          multiline ? 'h-28' : 'h-12',
          error ? 'border-red300' : 'border-grayscale200',
        ].join(' ')}
        textAlignVertical={multiline ? 'top' : 'center'}
      />

      {error ? <Text className="mt-s-10 text-75 text-red300">{error}</Text> : null}
    </View>
  );
}
