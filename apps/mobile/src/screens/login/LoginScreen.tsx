import { useState } from 'react';
import { Alert, View } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormProvider, useForm } from 'react-hook-form';
import type { z } from 'zod';

import { loginSchema } from '../../features/auth/login/model/loginSchema';

import { useAuth } from '../../auth/AuthProvider';
import type { RootStackParamList } from '../../navigation/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Text } from '../../shared/ui/Text';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * 웹 `features/auth/login/ui/LoginForm` 의 RN 대응물.
 *
 * 웹은 next-auth `signIn('credentials')` 을 거치지만 RN 은 BFF 가 없어
 * 셸(`authService`)이 직접 로그인하고 토큰을 Keychain 에 넣는다.
 * 이 화면은 그 사실을 모른다 — `useAuth().login` 만 부른다.
 *
 * 회원가입·카카오 로그인은 이번 범위가 아니다(이메일 인증 코드 / 딥링크 재설계 필요).
 */
export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formMethod = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = formMethod.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      await login(values);

      navigation.goBack();
    } catch (error) {
      // 백엔드가 주는 문구를 그대로 보여준다. 웹도 서버 메시지를 토스트에 띄운다.
      Alert.alert((error as Error)?.message ?? '로그인에 실패했어요.');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <FormProvider {...formMethod}>
      {/* 웹 LoginForm 은 `mt-4 flex flex-col items-center gap-6` — 요소 간격이 1.5rem 이다 */}
      <View className="mt-4 flex-1 flex-col gap-6 bg-white p-s-30">
        <Input<LoginFormValues> name="email" type="email" label="이메일" placeholder="이메일을 입력해주세요." />

        <Input<LoginFormValues>
          name="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요."
        />

        <Button className="w-full" isLoading={isSubmitting} onPress={onSubmit}>
          <Text.base className="font-semibold text-white">로그인</Text.base>
        </Button>
      </View>
    </FormProvider>
  );
}
