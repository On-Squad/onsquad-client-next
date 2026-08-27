import { useCallback } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import dayjs from 'dayjs';
import { PencilLine, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { crewQueries } from '../../entities/crew/api/crew.queries';
import { announceWriteUrl } from '../../entities/crew/lib/announceWebUrl';
import { refreshAnnounces } from './refreshAnnounces';

import { Article } from '../../shared/ui/Article';
import { Avatar } from '../../shared/ui/Avatar';
import { Badge } from '../../shared/ui/Badge';
import { Text } from '../../shared/ui/Text';
import { getRoleText } from '../../shared/lib/getRoleText';
import type { CrewRole } from '../../shared/types';
import type { RootStackParamList } from '../../navigation/types';

// lucide 는 색을 prop 으로 받는다 — 웹 AnnounceList 의 fill/stroke 값과 같다.
const PIN_COLOR = '#ffcd29';
const PIN_SIZE = 16;

export type AnnounceListContentProps = NativeStackScreenProps<RootStackParamList, 'AnnounceList'>;

/**
 * 웹 `features/crew/announce/ui/AnnounceList` 의 RN 미러.
 *
 * 데이터는 GET /crews/{id}/announces 에서 온다.
 * 항목을 누르면 AnnounceDetail 웹뷰로 이동한다.
 */
export function AnnounceListContent({ route, navigation }: AnnounceListContentProps) {
  const { crewId, crewName } = route.params;
  const insets = useSafeAreaInsets();

  const queryClient = useQueryClient();

  // **화면이 다시 보일 때마다 목록을 새로 받는다.**
  // 상단고정·글쓰기는 웹뷰 안에서 일어나고 그쪽 캐시 무효화는 여기까지 오지 않는다.
  // 처음 진입할 때도 한 번 도는데, 그건 이미 받아둔 값을 덮어쓰는 정도라 화면이 깜빡이지 않는다.
  useFocusEffect(
    useCallback(() => {
      void refreshAnnounces({ queryClient, crewId });
    }, [queryClient, crewId]),
  );

  const { data } = useSuspenseQuery(crewQueries.announceList({ crewId }));
  const canWrite = data.data.states.canWrite;
  const announces = data.data.announces;

  return (
    <ScrollView className="flex-1 bg-grayscale100" contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
      <View className="mx-5 mt-5">
        <Article
          className="w-full p-3"
          slot={
            <>
              <View className="flex-row items-center justify-between">
                <Text.lg className="font-bold">공지사항</Text.lg>
                {canWrite && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.push('AnnounceDetail', {
                        crewId,
                        crewName,
                        title: '공지 작성',
                        url: announceWriteUrl({ crewId }),
                      })
                    }
                  >
                    <View className="flex-row items-center gap-1 rounded border border-primary px-2 py-0.5">
                      <PencilLine size={12} strokeWidth={2} color="#6B7280" />
                      <Text.xxs className="font-bold">글쓰기</Text.xxs>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <View className="mt-6 flex-col">
                {announces.length === 0 ? (
                  <Text.xl>등록된 공지사항이 없어요.</Text.xl>
                ) : (
                  announces.map((announce, index) => (
                    <TouchableOpacity
                      key={announce.id}
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation.navigate('AnnounceDetail', {
                          crewId,
                          crewName,
                          announceId: announce.id,
                          title: '공지사항',
                        })
                      }
                    >
                      <View
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
                              <Text.xs>{announce.writer.nickname}</Text.xs>
                            </View>
                            <Badge className="px-0.5 py-0">
                              <Text.xxs>{getRoleText(announce.states.role as CrewRole)}</Text.xxs>
                            </Badge>
                          </View>

                          <Text.xs className="text-grayscale500">
                            {dayjs(announce.createdAt).format('YYYY년 MM월 DD일')}
                          </Text.xs>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </>
          }
        />
      </View>
    </ScrollView>
  );
}
