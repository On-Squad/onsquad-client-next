import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';

import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';

import { crewCheckGetFetch } from '@/entities/crew/api/new/crewCheckGetFetch';
import { addCrewSchema } from '@/features/crew/new/ui/validator';
import { HASH_TAG } from '@/shared/config';

import { Badge } from '../shared/ui/Badge';
import { FormField } from '../components/FormField';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CrewNew'>;

const MAX_HASHTAGS = 5;

export function CrewNewScreen({ navigation }: Props) {
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
  const [image, setImage] = useState<Asset | null>(null);
  const [nameChecked, setNameChecked] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addCrewSchema),
    defaultValues: { name: '', introduce: '', detail: '', kakaoLink: '', hashtags: [], file: undefined },
  });

  const hashtags = watch('hashtags') ?? [];

  // 웹은 useApiMutation 을 쓰지만 여기서는 셸이 세션을 쥐는 구조라 fetch 를 직접 부른다.
  const checkName = async () => {
    const name = getValues('name');

    if (!name) return;

    try {
      const res = await crewCheckGetFetch({ crewName: name });

      setNameChecked(true);
      Alert.alert(res.data.success ? '사용할 수 있는 이름이에요.' : '이미 사용 중인 이름이에요.');
    } catch {
      Alert.alert('확인에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
    const asset = result.assets?.[0];

    if (asset) {
      setImage(asset);
      setValue('file', asset as unknown as File);
    }
  };

  const toggleTag = (tag: string) => {
    const next = hashtags.includes(tag)
      ? hashtags.filter((item) => item !== tag)
      : hashtags.length < MAX_HASHTAGS
        ? [...hashtags, tag]
        : hashtags;

    setValue('hashtags', next, { shouldValidate: true });
  };

  const onSubmit = handleSubmit((values) => {
    // Task 4 에서 실제 제출 경로를 확인한다. 지금은 검증 통과 여부만 본다.
    Alert.alert('검증 통과', `${values.name} / 해시태그 ${values.hashtags.length}개`);
    navigation.goBack();
  });

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="p-s-30">
      <Pressable onPress={pickImage} className="mb-s-30 h-40 w-full items-center justify-center rounded-xl bg-grayscale100">
        {image?.uri ? (
          <Image source={{ uri: image.uri }} className="h-40 w-full rounded-xl" />
        ) : (
          <Text className="text-75 text-grayscale600">대표 이미지 선택</Text>
        )}
      </Pressable>

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <FormField
            label="크루 이름"
            placeholder="크루 이름을 입력해주세요."
            value={field.value}
            onChangeText={(text) => {
              field.onChange(text);
              setNameChecked(false);
            }}
            error={errors.name?.message}
            rightSlot={
              <Pressable onPress={checkName} className="rounded-md bg-grayscale100 px-s-20 py-s-10">
                <Text className="text-75 text-grayscale600">{nameChecked ? '확인됨' : '중복확인'}</Text>
              </Pressable>
            }
          />
        )}
      />

      <Controller
        control={control}
        name="introduce"
        render={({ field }) => (
          <FormField
            label="크루 소개"
            placeholder="크루 소개글을 작성해주세요."
            value={field.value}
            onChangeText={field.onChange}
            error={errors.introduce?.message}
            multiline
          />
        )}
      />

      <Controller
        control={control}
        name="detail"
        render={({ field }) => (
          <FormField
            label="크루 상세정보"
            placeholder="크루 상세정보를 작성해주세요."
            value={field.value}
            onChangeText={field.onChange}
            error={errors.detail?.message}
            multiline
          />
        )}
      />

      <View className="mb-s-30">
        <View className="mb-s-10 flex-row items-center justify-between">
          <Text className="text-75 font-semibold text-grayscale800">해시태그</Text>
          <Pressable onPress={() => setIsTagPickerOpen(true)} className="rounded-md bg-grayscale100 px-s-20 py-s-10">
            <Text className="text-75 text-grayscale600">선택</Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap gap-s-10">
          {hashtags.map((tag) => (
            <Badge key={tag} label={tag} onRemove={() => toggleTag(tag)} />
          ))}
        </View>

        {errors.hashtags?.message ? (
          <Text className="mt-s-10 text-75 text-red300">{errors.hashtags.message}</Text>
        ) : null}
      </View>

      <Controller
        control={control}
        name="kakaoLink"
        render={({ field }) => (
          <FormField
            label="오픈카톡"
            placeholder="크루 소통방 링크를 입력해주세요."
            value={field.value}
            onChangeText={field.onChange}
            error={errors.kakaoLink?.message}
          />
        )}
      />

      <Pressable onPress={onSubmit} className="mt-s-20 items-center rounded-lg bg-primary500 py-s-30">
        <Text className="text-100 font-semibold text-white">크루 개설하기</Text>
      </Pressable>

      {/* 웹은 overlay-kit + BottomSheet 를 쓰지만, 버릴 코드에 의존성을 늘리지 않으려고 RN 내장 Modal 로 대체했다. */}
      <Modal visible={isTagPickerOpen} animationType="slide" transparent onRequestClose={() => setIsTagPickerOpen(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[70%] rounded-t-2xl bg-white p-s-30">
            <View className="mb-s-30 flex-row items-center justify-between">
              <Text className="text-100 font-bold">해시태그 (최대 {MAX_HASHTAGS}개)</Text>
              <Pressable onPress={() => setIsTagPickerOpen(false)}>
                <Text className="text-75 text-primary500">닫기</Text>
              </Pressable>
            </View>

            <ScrollView>
              <View className="flex-row flex-wrap gap-s-10">
                {HASH_TAG.map((tag) => (
                  <Badge key={tag} label={tag} selected={hashtags.includes(tag)} onPress={() => toggleTag(tag)} />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
