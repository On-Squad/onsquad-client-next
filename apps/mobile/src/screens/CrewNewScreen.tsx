import { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';

import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { crewCheckGetFetch } from '@/entities/crew/api/new/crewCheckGetFetch';
import { addCrewSchema } from '@/features/crew/new/model/addCrewSchema';
import { HASH_TAG } from '@/shared/config';

import { Badge } from '../shared/ui/Badge';
import { Button } from '../shared/ui/Button';
import { Input } from '../shared/ui/Input';
import { Text } from '../shared/ui/Text';
import { Textarea } from '../shared/ui/Textarea';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CrewNew'>;

const MAX_HASHTAGS = 5;

type AddCrewFormValues = z.infer<typeof addCrewSchema>;

export function CrewNewScreen({ navigation }: Props) {
  const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
  const [image, setImage] = useState<Asset | null>(null);
  const [nameChecked, setNameChecked] = useState(false);

  const formMethod = useForm<AddCrewFormValues>({
    resolver: zodResolver(addCrewSchema),
    defaultValues: { name: '', introduce: '', detail: '', kakaoLink: '', hashtags: [], file: undefined },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = formMethod;

  const hashtags = watch('hashtags') ?? [];
  const watchedName = watch('name');

  useEffect(() => {
    setNameChecked(false);
  }, [watchedName]);

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
    <FormProvider {...formMethod}>
      <ScrollView className="flex-1 bg-white" contentContainerClassName="p-s-30">
        <Pressable onPress={pickImage} className="mb-s-30 h-40 w-full items-center justify-center rounded-xl bg-grayscale100">
          {image?.uri ? (
            <Image source={{ uri: image.uri }} className="h-40 w-full rounded-xl" />
          ) : (
            <RNText className="text-75 text-grayscale600">대표 이미지 선택</RNText>
          )}
        </Pressable>

        <Input<AddCrewFormValues>
          name="name"
          type="text"
          label="크루 이름"
          placeholder="크루 이름을 입력해주세요."
          button={
            /* 위치·색은 웹 `shared/ui/InputButton` 과 같다 — 입력창 안 우측에 겹쳐 놓는다.
               absolute 를 안 주면 RN 은 flow 로 흘려 입력창 아래에 붙는다. */
            <Pressable
              onPress={checkName}
              className="absolute right-2 top-2 items-center justify-center rounded-md bg-[#f8f8f8] px-2 py-1"
            >
              <RNText className="text-xs text-grayscale500">{nameChecked ? '확인됨' : '중복확인'}</RNText>
            </Pressable>
          }
        />

        <Textarea<AddCrewFormValues> name="introduce" label="크루 소개" placeholder="크루 소개글을 작성해주세요." />

        <Textarea<AddCrewFormValues> name="detail" label="크루 상세정보" placeholder="크루 상세정보를 작성해주세요." />

        <View className="mb-s-30">
          <View className="mb-s-10 flex-row items-center justify-between">
            <RNText className="text-75 font-semibold text-grayscale800">해시태그</RNText>
            <Pressable onPress={() => setIsTagPickerOpen(true)} className="rounded-md bg-grayscale100 px-s-20 py-s-10">
              <RNText className="text-75 text-grayscale600">선택</RNText>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap gap-s-10">
            {hashtags.map((tag) => (
              <Badge key={tag} onRemove={() => toggleTag(tag)}>{`#${tag}`}</Badge>
            ))}
          </View>

          {errors.hashtags?.message ? (
            <RNText className="mt-s-10 text-75 text-red300">{errors.hashtags.message}</RNText>
          ) : null}
        </View>

        <Input<AddCrewFormValues> name="kakaoLink" type="text" label="오픈카톡" placeholder="크루 소통방 링크를 입력해주세요." />

        <Button className="mt-s-20" onPress={onSubmit}>
          <Text.base className="font-semibold text-white">크루 개설하기</Text.base>
        </Button>

        {/* 웹은 overlay-kit + BottomSheet 를 쓰지만, 버릴 코드에 의존성을 늘리지 않으려고 RN 내장 Modal 로 대체했다. */}
        <Modal visible={isTagPickerOpen} animationType="slide" transparent onRequestClose={() => setIsTagPickerOpen(false)}>
          <View className="flex-1 justify-end bg-black/40">
            <View className="max-h-[70%] rounded-t-2xl bg-white p-s-30">
              <View className="mb-s-30 flex-row items-center justify-between">
                <RNText className="text-100 font-bold">해시태그 (최대 {MAX_HASHTAGS}개)</RNText>
                <Pressable onPress={() => setIsTagPickerOpen(false)}>
                  <RNText className="text-75 text-primary500">닫기</RNText>
                </Pressable>
              </View>

              <ScrollView>
                <View className="flex-row flex-wrap gap-s-10">
                  {HASH_TAG.map((tag) => (
                    <Badge
                      key={tag}
                      selected={hashtags.includes(tag)}
                      onPress={() => toggleTag(tag)}
                    >{`#${tag}`}</Badge>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </FormProvider>
  );
}
