import { View } from 'react-native';

import dayjs from 'dayjs';
import { Star } from 'lucide-react-native';

import type { CrewHomeData } from '../../../../entities/crew/types/crew.types';
import { getRoleText } from '../../../../shared/lib/getRoleText';
import type { CrewRole } from '../../../../shared/types';

import { Article } from '../../../../shared/ui/Article';
import { Avatar } from '../../../../shared/ui/Avatar';
import { Badge } from '../../../../shared/ui/Badge';
import { Text } from '../../../../shared/ui/Text';

interface CrewAnnouncePanelProps {
  announces?: CrewHomeData['announces'];
}

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외).
// 웹 CrewAnnounceList 의 fill/stroke 값과 같다.
const PIN_COLOR = '#FFCD29';

const PIN_SIZE = 16;

/**
 * 웹 `features/crew/home/ui/CrewAnnounceList` 의 RN 미러.
 *
 * "더보기" 는 **모양만 두고 동작을 비운다.** 이동 대상(`/crews/{id}/announce`)이
 * 4d 웹뷰 잔류 대상이라 아직 갈 곳이 없다. 지웠다가 다시 그리면 웹과 대조할 기준이 사라진다.
 */
export function CrewAnnouncePanel({ announces }: CrewAnnouncePanelProps) {
  return (
    <Article
      className="h-[360px] w-full p-3"
      slot={
        <>
          <View className="flex-row items-center justify-between">
            <Text.lg className="font-bold">공지사항</Text.lg>
            <Text.xs className="text-grayscale500">더보기</Text.xs>
          </View>

          <View className="mt-8 flex-col">
            {announces && announces.length > 0 ? (
              announces.map((announce, index) => (
                <View
                  key={announce.id}
                  className={
                    index === 0
                      ? 'mt-2 flex-col justify-center gap-2'
                      : 'mt-2 flex-col justify-center gap-2 border-t border-grayscale200'
                  }
                >
                  <View className="mt-2 flex-row justify-between">
                    <Text.base className="font-semibold">{announce.title}</Text.base>
                    {announce.pinned ? <Star size={PIN_SIZE} fill={PIN_COLOR} stroke={PIN_COLOR} /> : null}
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-[3px]">
                      <View className="flex-row items-center gap-0.5">
                        <Avatar className="h-4 w-4" />
                        <Text.xs>{announce.writer?.nickname}</Text.xs>
                      </View>
                      <Badge className="px-0.5 py-0">
                        <Text.xxs>{getRoleText((announce.states?.role ?? 'OWNER') as CrewRole)}</Text.xxs>
                      </Badge>
                    </View>

                    <Text.xs className="text-grayscale500">
                      {dayjs(announce.createdAt).format('YYYY년 MM월 DD일')}
                    </Text.xs>
                  </View>
                </View>
              ))
            ) : (
              <Text.xl>등록된 공지사항이 없어요.</Text.xl>
            )}
          </View>
        </>
      }
    />
  );
}
