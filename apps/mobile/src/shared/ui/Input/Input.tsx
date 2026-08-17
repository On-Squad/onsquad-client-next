import type { ReactNode } from 'react';
import { TextInput, View } from 'react-native';

import { type FieldValues, type Path, Controller, useFormContext } from 'react-hook-form';

import { numberExtract } from '@/shared/lib/utils/numberExtract';

import { Text } from '../Text';

interface CustomInputPropsType<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  helperText?: string;
  className?: string;

  type: 'email' | 'text' | 'password';

  extractNumber?: boolean;
  button?: ReactNode | ReactNode[];
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

// RN 내장 prop 이라 className 이 먹지 않는다 — 토큰 예외.
// 웹의 placeholder:text-grayscale500 에 해당한다.
const PLACEHOLDER_COLOR = '#909090';

/**
 * 웹 `shared/ui/Input` 의 RN 미러.
 *
 * 웹과 동일하게 FormProvider 안에서만 동작한다 — 화면은 name 만 넘긴다.
 * Controller 를 화면이 아니라 이 안에 두는 것이 웹과 같은 계약을 만든다.
 */
const Input = <T extends FieldValues>(props: CustomInputPropsType<T>) => {
  const {
    name,
    label,
    button,
    type,
    helperText,
    extractNumber = false,
    className,
    placeholder,
    maxLength,
    disabled,
    readOnly,
  } = props;

  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const fieldError = errors[name];
  const errorMessage = fieldError ? (fieldError.message as string) : null;

  return (
    <View className="w-full">
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <View className="w-full">
            {label ? (
              <View className="mb-2 flex-row items-center">
                <Text.base className="font-bold text-grayscale800">{label}</Text.base>
              </View>
            ) : null}

            <View className="relative">
              <TextInput
                value={value}
                onChangeText={(text) => onChange(extractNumber ? (numberExtract(text) ?? '') : text)}
                placeholder={placeholder}
                placeholderTextColor={PLACEHOLDER_COLOR}
                maxLength={maxLength}
                editable={!disabled && !readOnly}
                keyboardType={type === 'email' ? 'email-address' : 'default'}
                autoCapitalize={type === 'email' ? 'none' : 'sentences'}
                secureTextEntry={type === 'password'}
                className={[
                  'block h-12 w-full rounded-md border border-[#f8f8f8] px-3 py-2 text-grayscale900',
                  fieldError ? 'border-2 border-red-500' : '',
                  className ?? '',
                ].join(' ')}
              />
              {button}
            </View>

            {fieldError ? (
              <Text.sm className="mt-2 text-left text-red-600">{errorMessage}</Text.sm>
            ) : helperText ? (
              <Text.sm className="mt-2 text-left text-gray-500">{helperText}</Text.sm>
            ) : null}
          </View>
        )}
      />
    </View>
  );
};

export default Input;
