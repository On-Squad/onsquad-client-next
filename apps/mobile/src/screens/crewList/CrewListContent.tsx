import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { crewQueries } from '../../entities/crew/api/crew.queries';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { CrewListCard, type CrewListItem } from '../../widgets/CrewList';

// 탭 화면이지만 상세로 가려면 부모 스택을 타야 한다 — 두 내비게이터를 합친다.
export type CrewListContentProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Community'>,
  NativeStackScreenProps<RootStackParamList>
>;

// 웹 WithTabLayout 의 px-5 pt-5 pb-5 = 20px.
const LIST_PADDING = 'p-5';

/** 카드 사이 간격. 웹 CrewList 의 grid gap-3 에 대응한다. */
const CARD_GAP = 'mb-3';

// ActivityIndicator 계열은 prop 이라 className 이 안 먹는다 — 토큰 예외.
const REFRESH_TINT = '#FF7800';

export function CrewListContent({ navigation }: CrewListContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useSuspenseInfiniteQuery(
    crewQueries.infiniteList(),
  );

  // 웹은 usePullToRefresh 가 레이아웃 전역에서 활성 쿼리를 invalidate 한다.
  // RN 은 목록마다 RefreshControl 을 다는 것이 관례다 — 같은 결과를 준다.
  const handleRefresh = async () => {
    setIsRefreshing(true);

    await refetch();

    setIsRefreshing(false);
  };

  const crews = data.pages.flatMap((page) => page.data.results) as CrewListItem[];

  return (
    <View className="flex-1 bg-grayscale100">
      <FlatList
        data={crews}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName={LIST_PADDING}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={REFRESH_TINT} />
        }
        // 웹은 sentinel + useInView 로 다음 장을 부른다. RN 은 목록이 직접 알려준다.
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <View className={CARD_GAP}>
            <CrewListCard
              crew={item}
              onPress={() => navigation.navigate('CrewDetail', { crewId: item.id, crewName: item.name })}
            />
          </View>
        )}
      />
    </View>
  );
}
