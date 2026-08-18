import { View } from 'react-native';

import type { CrewHomeData } from '@/entities/crew';

import { Article } from '../../../../shared/ui/Article';
import { Avatar } from '../../../../shared/ui/Avatar';
import { Badge } from '../../../../shared/ui/Badge';
import { Text } from '../../../../shared/ui/Text';

interface CrewInfoPanelProps {
  crew?: CrewHomeData['crew'];
}

/**
 * 웹 `features/crew/home/ui/CrewInfoSection` 의 RN 미러.
 *
 * 해시태그에 '#' 를 붙이지 않는다 — 웹 `CrewInfoSection` 이 `<Badge>{tag}</Badge>` 로
 * '#' 없이 쓰기 때문이다. 미러링이 원칙이므로 웹을 따른다.
 * (크루 개설 폼·크루 상세는 붙인다. 거기는 웹도 붙인다.)
 */
export function CrewInfoPanel({ crew }: CrewInfoPanelProps) {
  return (
    <Article
      className="h-[360px] w-full p-3"
      slot={
        <View className="h-full flex-col gap-3">
          <Text.lg className="mb-1 font-bold">{crew?.name}</Text.lg>

          <View className="flex-col gap-2">
            <View className="mb-1 flex-row items-center gap-2">
              <Text.base className="font-semibold">크루장</Text.base>
              <View className="flex-row gap-1">
                <Avatar className="h-4 w-4" />
                <Text.xs className="font-medium">{crew?.owner.nickname}</Text.xs>
              </View>
            </View>
            <Text.xs>{crew?.introduce}</Text.xs>
          </View>

          <View className="mt-1 grow flex-col gap-2">
            <Text.base className="mb-1 font-semibold">크루 상세정보</Text.base>
            <Text.xs numberOfLines={6}>{crew?.detail}</Text.xs>
          </View>

          <View className="flex-row flex-wrap items-center gap-1">
            <Badge>멤버 수 {crew?.memberCount} 명</Badge>
            {crew?.hashtags.map((tag) => (
              <Badge key={String(tag)}>{String(tag)}</Badge>
            ))}
          </View>
        </View>
      }
    />
  );
}
