import { Pressable, Text, View } from 'react-native';

interface ChipProps {
  label: string;
  /** 넘기면 우측에 삭제 버튼이 붙는다. */
  onRemove?: () => void;
  /** 선택 목록에서 고르는 용도로 쓸 때. */
  onPress?: () => void;
  selected?: boolean;
}

/** 웹의 `shared/ui/Badge` 에 대응하는 RN 조각. 해시태그 표시와 선택 양쪽에 쓴다. */
export function Chip({ label, onRemove, onPress, selected = false }: ChipProps) {
  const body = (
    <View
      className={[
        'flex-row items-center gap-s-10 rounded-full px-s-30 py-s-10',
        selected ? 'bg-primary500' : 'bg-grayscale100',
      ].join(' ')}
    >
      <Text className={['text-75', selected ? 'text-white' : 'text-grayscale600'].join(' ')}>#{label}</Text>

      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text className={['text-75', selected ? 'text-white' : 'text-grayscale600'].join(' ')}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );

  if (!onPress) {
    return body;
  }

  return <Pressable onPress={onPress}>{body}</Pressable>;
}
