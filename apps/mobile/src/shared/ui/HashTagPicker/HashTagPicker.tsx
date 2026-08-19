import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { cn } from '../../lib/utils';
import { Button } from '../Button';
import { Text } from '../Text';

interface HashTagPickerProps {
  /** 현재 선택돼 있는 태그. 시트를 열 때의 기준값이다. */
  selected: string[];
  tags: readonly string[];
  maxCount: number;
  onSubmit: (tags: string[]) => void;
  onCancel: () => void;
  /** 최대 개수를 넘겼을 때. 웹은 토스트를 띄운다. */
  onExceed: () => void;
}

/**
 * 웹 `shared/ui/Accordion` 이 해시태그 시트 안에서 하던 일의 RN 미러.
 *
 * 웹은 아코디언 안에 그리드를 넣지만 **그룹이 하나뿐**(`ACCORDION_HASH_TAG_LIST` 의 '해시태그')이라
 * RN 에서는 접는 동작을 생략하고 그리드만 둔다. 접을 대상이 없으면 아코디언은 장식이다.
 *
 * **선택은 즉시 반영되지 않는다** — 웹과 같이 시트 안에서만 쌓아두고
 * "입력완료" 를 눌러야 폼에 들어간다. "취소" 는 선택을 비운다(웹 동작 그대로).
 */
export function HashTagPicker({ selected, tags, maxCount, onSubmit, onCancel, onExceed }: HashTagPickerProps) {
  const [staged, setStaged] = useState<string[]>(selected);

  // 시트를 다시 열면 바깥의 현재 값에서 시작해야 한다.
  useEffect(() => setStaged(selected), [selected]);

  const toggle = (tag: string) => {
    if (staged.includes(tag)) {
      setStaged(staged.filter((item) => item !== tag));

      return;
    }

    if (staged.length >= maxCount) {
      onExceed();

      return;
    }

    setStaged([...staged, tag]);
  };

  return (
    <>
      <View className="mb-4">
        <Text.lg className="font-medium">해시태그</Text.lg>
      </View>

      {/* 웹: grid-cols-2 gap-1, 각 칸 h-[45px]. RN 에 grid 가 없어 flex-wrap 으로 절반 폭을 준다. */}
      <ScrollView className="max-h-72">
        <View className="flex-row flex-wrap">
          {tags.map((tag) => (
            <View key={tag} className="w-1/2 p-0.5">
              <Pressable
                className={cn(
                  'h-[45px] items-center justify-center rounded-lg border border-grayscale200 bg-white',
                  staged.includes(tag) && 'border-secondary bg-secondary',
                )}
                onPress={() => toggle(tag)}
              >
                <Text.lg className={staged.includes(tag) ? 'text-white' : 'text-grayscale400'}>{tag}</Text.lg>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="mt-4 flex-col gap-2">
        <Button className="w-full" onPress={() => onSubmit(staged)}>
          <Text.base className="font-semibold text-white">입력완료</Text.base>
        </Button>

        <Button
          className="w-full bg-grayscale200"
          onPress={() => {
            setStaged([]);
            onCancel();
          }}
        >
          <Text.base className="font-semibold text-grayscale500">취소</Text.base>
        </Button>
      </View>
    </>
  );
}
