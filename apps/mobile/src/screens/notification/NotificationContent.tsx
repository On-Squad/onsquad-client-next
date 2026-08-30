import { useCallback } from 'react';
import { Pressable, SectionList, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';

import {
  groupNotificationsByDate,
  notificationQueries,
  useReadAllNotificationMutation,
  useReadNotificationMutation,
} from '../../entities/notification';
import { refreshNotifications } from './refreshNotifications';
import type { NotificationListItem } from '../../entities/notification';
import type { RootStackParamList } from '../../navigation/types';
import { cn } from '../../shared/lib/utils';
import { Loader } from '../../shared/ui/Loader';
import { PullToRefresh } from '../../shared/ui/PullToRefresh';
import { Text } from '../../shared/ui/Text';
import { ZapBadge } from '../../shared/ui/ZapBadge';

export type NotificationContentProps = NativeStackScreenProps<RootStackParamList, 'Notification'>;

interface NotificationCardProps {
  item: NotificationListItem;
  onRead: () => void;
  isReading: boolean;
  onNavigateCrew: (crewId: number, crewName: string) => void;
}

/**
 * 웹 `features/notification/list/ui/NotificationCard` 의 RN 미러.
 * ⋮ 옵션 버튼은 그리지 않는다(합의된 생략).
 * 알림을 누르면 크루 상세로 이동하고 읽음은 뒤따른다.
 */
function NotificationCard({ item, onRead, isReading, onNavigateCrew }: NotificationCardProps) {
  const target = item.payload?.crewName ?? item.payload?.squadTitle ?? '';
  const message = item.payload?.message ?? '';

  const handlePress = () => {
    if (item.payload?.crewId && item.payload?.crewName) {
      onNavigateCrew(item.payload.crewId, item.payload.crewName);
    }
    if (!item.read && !isReading) {
      onRead();
    }
  };

  return (
    <View className="gap-s-20 p-s-30 flex-row items-center rounded-xl bg-white">
      {!item.read && <ZapBadge />}
      <Pressable
        onPress={handlePress}
        disabled={item.read && !item.payload?.crewId}
        className="gap-s-10 flex-1 flex-col"
      >
        {target ? (
          <Text.sm className="font-medium tracking-[-0.28px] text-grayscale600">{target}</Text.sm>
        ) : null}
        <Text.sm className="font-regular tracking-[-0.28px] text-grayscale900">{message}</Text.sm>
      </Pressable>
    </View>
  );
}

/**
 * 웹 `pages/notifications/ui/NotificationListPage` + `features/notification/list` 의 RN 미러.
 *
 * 무한스크롤은 SectionList 의 `onEndReached`, 당겨서 새로고침은 PullToRefresh 로 구현한다.
 * `useSuspenseInfiniteQuery` 를 써서 ErrorHandlingWrapper 의 suspense 경계가 초기 로딩을 처리한다.
 */
export function NotificationContent({ navigation }: NotificationContentProps) {
  const queryClient = useQueryClient();

  // **화면이 다시 보일 때마다 목록을 새로 받는다.**
  // 크루 상세로 이동했다 돌아온 상황처럼 다른 화면에서 읽음 상태가 달라졌을 수 있다.
  useFocusEffect(
    useCallback(() => {
      void refreshNotifications({ queryClient });
    }, [queryClient]),
  );

  const { data, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(notificationQueries.infiniteList());

  const readNotification = useReadNotificationMutation();
  const readAllNotification = useReadAllNotificationMutation();

  const list = data.pages.flatMap((page) => page.data.results);
  const sections = groupNotificationsByDate(list);
  const hasUnread = list.some((item) => !item.read);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleNavigateCrew = useCallback(
    (crewId: number, crewName: string) => {
      navigation.navigate('CrewDetail', { crewId, crewName });
    },
    [navigation],
  );

  return (
    <PullToRefresh onRefresh={refetch}>
      {(scrollProps) => (
        <SectionList
          {...scrollProps}
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onRead={() => readNotification.mutate(item.id)}
              isReading={readNotification.isPending}
              onNavigateCrew={handleNavigateCrew}
            />
          )}
          renderSectionHeader={({ section }) => (
            // 웹은 그룹 컨테이너의 `gap-s-60` 으로 그룹 사이를 벌리고 `gap-s-20` 으로
            // 날짜 헤더와 첫 카드를 벌린다. SectionList 엔 그 컨테이너가 없어 헤더의
            // 위/아래 여백으로 같은 간격을 만든다 — 첫 그룹 위는 헤더 행의 `pb-s-20`
            // 이 이미 담당하므로 위 여백을 주지 않는다.
            <View
              className={cn(
                'pb-s-20 flex-row items-center',
                section.title !== sections[0]?.title && 'mt-s-60',
              )}
            >
              <Text.xl className="font-bold tracking-[-0.4px] text-grayscale900">
                {section.title}
              </Text.xl>
            </View>
          )}
          ItemSeparatorComponent={() => <View className="h-s-20" />}
          ListHeaderComponent={
            // 웹은 목록이 비면 '모두 읽음' 을 그리지 않고 빈 문구만 보여준다.
            sections.length === 0 ? null : (
              <View className="pb-s-20 flex-row justify-end">
                <Pressable
                  onPress={() => readAllNotification.mutate()}
                  disabled={!hasUnread || readAllNotification.isPending}
                >
                  <Text.sm
                    className={
                      hasUnread && !readAllNotification.isPending
                        ? 'font-medium text-primary500'
                        : 'font-medium text-grayscale400'
                    }
                  >
                    모두 읽음
                  </Text.sm>
                </Pressable>
              </View>
            )
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text.sm className="text-grayscale500">받은 알림이 없어요.</Text.sm>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <Loader />
              </View>
            ) : null
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ padding: 20 }}
          className="flex-1 bg-grayscale100"
        />
      )}
    </PullToRefresh>
  );
}
