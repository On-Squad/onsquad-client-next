import { useEffect, useMemo, useState, useTransition } from 'react';
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

/** 검색 결과를 기다리는 동안 목록을 흐리게 한다. */
const DIMMED_OPACITY = 0.4;

export function CrewListContent({ navigation }: CrewListContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  /**
   * **검색어 변경을 transition 으로 감싼다.**
   *
   * `useSuspenseInfiniteQuery` 는 쿼리 키가 바뀌면 다시 suspend 한다.
   * 그대로 두면 이 컴포넌트 전체가 Suspense 폴백으로 갈려 **hero 와 검색창까지 사라지고
   * 입력 포커스가 풀린다**(실측).
   *
   * transition 안에서 바꾸면 React 가 **이전 화면을 유지한 채** 새 데이터를 기다리고,
   * `isSearching` 으로 "지금 바뀌는 중" 을 알려준다 — 목록만 딤 처리하면 된다.
   */
  const [isSearching, startTransition] = useTransition();

  // 웹 CommunityContainer 와 같은 방식이다 — es-toolkit 의 debounce 를 useMemo 로 한 번만 만든다.
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        startTransition(() => setDebouncedSearch(value));
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

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
                  {/*
                    **높이를 고정한다.** RN `TextInput` 은 padding 만 주면 글자가 들어오는 순간
                    글꼴 메트릭으로 높이를 다시 계산해 인풋이 찌그러진다(실측).
                    웹 shadcn `input` 도 `h-10` 으로 고정하고 있고,
                    RN 쪽 `shared/ui/Input` 은 `h-12` 를 쓴다 — 그것과 맞춘다.
                  */}
                  <TextInput
                    className="h-12 w-full rounded-md border border-grayscale200 bg-white px-3 pr-10 text-sm text-grayscale900"
                    placeholder="크루를 검색해보세요."
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    value={searchText}
                    onChangeText={setSearchText}
                    returnKeyType="search"
                  />
                  <View className="absolute right-3 top-4">
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
          <View className="items-center gap-3 py-16" style={{ opacity: isSearching ? DIMMED_OPACITY : 1 }}>
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
          // 딤은 **아이템에만** 준다. FlatList 에 주면 ListHeaderComponent 인
          // hero·검색창까지 함께 흐려진다(실측).
          <View className="mb-3 px-5" style={{ opacity: isSearching ? DIMMED_OPACITY : 1 }}>
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
