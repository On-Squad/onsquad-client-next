import { Pressable } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';

// 웹 Appbar 의 <ChevronLeft color="#636363" strokeWidth={1.25} /> 와 같은 값.
// lucide 는 색을 prop 으로 받으므로 className 대상이 아니다 — 토큰 예외.
const CHEVRON_COLOR = '#636363';
const CHEVRON_STROKE_WIDTH = 1.25;

/** 웹 Appbar 좌측 슬롯의 RN 대응물. 뒤로 갈 곳이 없으면 그리지 않는다(호출부에서 판단). */
export function BackButton() {
  const navigation = useNavigation();

  return (
    <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
      <ChevronLeft color={CHEVRON_COLOR} strokeWidth={CHEVRON_STROKE_WIDTH} />
    </Pressable>
  );
}
