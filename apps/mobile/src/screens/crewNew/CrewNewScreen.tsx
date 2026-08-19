import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';

import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { crewCheckGetFetch } from '../../entities/crew/api/crewCheckGetFetch';
import { addCrewSchema } from '../../features/crew/new/model/addCrewSchema';
import { HASH_TAG } from '../../shared/config/hashTag';

import { Badge } from '../../shared/ui/Badge';
import { BottomSheet } from '../../shared/ui/BottomSheet';
import { HashTagPicker } from '../../shared/ui/HashTagPicker';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Text } from '../../shared/ui/Text';
import { Textarea } from '../../shared/ui/Textarea';
import type { RootStackParamList } from '../../navigation/types';

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

  const { handleSubmit, watch, setValue, getValues } = formMethod;

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
        <Pressable onPress={pickImage} className="h-40 w-full items-center justify-center rounded-xl bg-grayscale100">
          {image?.uri ? (
            <Image source={{ uri: image.uri }} className="h-40 w-full rounded-xl" />
          ) : (
            <RNText className="text-75 text-grayscale600">대표 이미지 선택</RNText>
          )}
        </Pressable>

        {/* 웹 CrewForm 은 필드마다 mt-6(1.5rem) 로 간격을 준다 */}
        <View className="mt-6">
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
        </View>

        <View className="mt-6">
          <Textarea<AddCrewFormValues> name="introduce" label="크루 소개" placeholder="크루 소개글을 작성해주세요." />
        </View>

        <View className="mt-6">
          <Textarea<AddCrewFormValues> name="detail" label="크루 상세정보" placeholder="크루 상세정보를 작성해주세요." />
        </View>

        {/* 웹 CrewForm 과 같다 — 라벨 붙은 **비활성 Input** 안에 '선택하기' 버튼을 겹쳐 놓는다.
            직접 입력하는 칸이 아니라 시트를 여는 자리다. */}
        <View className="mt-6">
          <Input<AddCrewFormValues>
            name="hashtags"
            type="text"
            label="해시태그"
            placeholder="크루를 나타내는 태그를 작성해 보세요."
            maxLength={15}
            disabled
            button={
              <Pressable
                onPress={() => setIsTagPickerOpen(true)}
                className="absolute right-2 top-2 items-center justify-center rounded-md bg-[#f8f8f8] px-2 py-1"
              >
                <RNText className="text-xs text-grayscale500">선택하기</RNText>
              </Pressable>
            }
          />

          <View className="mt-3 flex-row flex-wrap items-center gap-1">
            {hashtags.map((tag) => (
              <Badge
                key={tag}
                className="rounded-xl border-secondary bg-white"
                labelClassName="text-secondary"
                onRemove={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </View>

        </View>

        <View className="mt-6">
          <Input<AddCrewFormValues> name="kakaoLink" type="text" label="오픈카톡" placeholder="크루 소통방 링크를 입력해주세요." />
        </View>

        <Button className="mt-6" onPress={onSubmit}>
          <Text.base className="font-semibold text-white">크루 개설하기</Text.base>
        </Button>

        {/* 웹 CrewForm 과 같은 구조 — BottomSheet('크루 해시태그') 안에 태그 그리드와 입력완료/취소 */}
        <BottomSheet title="크루 해시태그" isOpen={isTagPickerOpen} onClose={() => setIsTagPickerOpen(false)}>
          <HashTagPicker
            selected={hashtags}
            tags={HASH_TAG}
            maxCount={MAX_HASHTAGS}
            onSubmit={(tags) => {
              setValue('hashtags', tags, { shouldValidate: true });
              setIsTagPickerOpen(false);
            }}
            onCancel={() => setIsTagPickerOpen(false)}
            onExceed={() => Alert.alert(`최대 ${MAX_HASHTAGS}개까지 등록가능해요.`)}
          />
        </BottomSheet>
      </ScrollView>
    </FormProvider>
  );
}
