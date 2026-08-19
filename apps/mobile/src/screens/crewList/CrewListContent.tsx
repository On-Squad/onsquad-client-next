import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, TextInput, View } from 'react-native';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react-native';
import { debounce } from 'es-toolkit';

import SearchBanner from '../../assets/images/search_banner.svg';
import { crewQueries } from '../../entities/crew/api/crew.queries';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Text } from '../../shared/ui/Text';
import { CrewListCard, type CrewListItem } from '../../widgets/CrewList';

export type CrewListContentProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Community'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** 웹 hero 의 `min-h-56` = 224px. 배너 SVG 가 배경으로 깔린다. */
const HERO_HEIGHT = 224;

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외). 웹 Searchbar 와 같다.
const SEARCH_ICON_COLOR = '#8c8c8c';

const SEARCH_ICON_SIZE = 16;

// RN 내장 prop 이라 className 이 안 먹는다 — 웹 placeholder:text-grayscale500 대응.
const PLACEHOLDER_COLOR = '#909090';

const REFRESH_TINT = '#FF7800';

/** 웹은 500ms 디바운스 후 검색어를 쿼리에 넣는다. */
const SEARCH_DEBOUNCE_MS = 500;

export function CrewListContent({ navigation }: CrewListContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 웹 CommunityContainer 와 같은 방식이다 — es-toolkit 의 debounce 를 useMemo 로 한 번만 만든다.
  const debouncedSetSearch = useMemo(() => debounce((value: string) => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS), []);

  useEffect(() => {
    debouncedSetSearch(searchText);
  }, [searchText, debouncedSetSearch]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useSuspenseInfiniteQuery(
    crewQueries.infiniteList({ crewName: debouncedSearch }),
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
        contentContainerClassName="pb-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={REFRESH_TINT} />
        }
        ListHeaderComponent={
          <>
            {/* 웹 hero — 배너 SVG 를 배경으로 깔고 아래쪽에 검색창을 얹는다 */}
            <View className="w-full justify-end bg-[#d9d9d9]" style={{ height: HERO_HEIGHT }}>
              <View className="absolute inset-0">
                <SearchBanner width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
              </View>

              <View className="w-full px-5 pb-4">
                <View className="relative">
                  <TextInput
                    className="w-full rounded-md border border-grayscale200 bg-white px-3 py-2.5 pr-10 text-sm"
                    placeholder="크루를 검색해보세요."
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={searchText}
                    onChangeText={setSearchText}
                    returnKeyType="search"
                  />
                  <View className="absolute right-3 top-3">
                    <Search size={SEARCH_ICON_SIZE} color={SEARCH_ICON_COLOR} />
                  </View>
                </View>
              </View>
            </View>

            <View className="mt-7 px-5 pb-3">
              <Text.lg className="font-semibold">모집중인 크루</Text.lg>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="items-center gap-3 py-16">
            <Text.sm className="text-grayscale500">검색 결과가 없습니다.</Text.sm>
            <Text.sm className="text-grayscale500">다른 검색어로 시도해보세요.</Text.sm>
          </View>
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <View className="mb-3 px-5">
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
