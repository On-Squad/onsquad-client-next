import { View } from 'react-native';

import { Zap } from 'lucide-react-native';

// lucide 는 색을 prop 으로 받는다 — 웹 ZapBadge 의 fill-white text-white 와 같은 값이다.
const ZAP_COLOR = '#FFFFFF';
const ZAP_SIZE = 12;

/**
 * 웹 `shared/ui/ZapBadge` 의 RN 미러.
 * 원형 primary500 배경 + 흰색 Zap 아이콘 배지. 안읽음 표시에 쓴다.
 */
export function ZapBadge() {
  return (
    <View className="h-5 w-5 items-center justify-center rounded-full bg-primary500">
      <Zap size={ZAP_SIZE} color={ZAP_COLOR} fill={ZAP_COLOR} />
    </View>
  );
}
