import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import MainBanner from '../../assets/images/main_banner.svg';
import OnsquadLogo from '../../assets/icons/onsquad_logo.svg';
import { crewQueries } from '../../entities/crew/api/crew.queries';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Text } from '../../shared/ui/Text';
import { CrewListCard, CrewListHeader, type CrewListItem } from '../../widgets/CrewList';

export type HomeContentProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

// 웹 HomePage 의 <Image width={220} height={110} />
const BANNER_WIDTH = 220;

const BANNER_HEIGHT = 110;

// 웹 hero 안의 로고. `온스쿼드에 합류하세요!` 줄에 들어간다.
const LOGO_WIDTH = 92;

const LOGO_HEIGHT = 24;

// ActivityIndicator 계열은 prop 이라 className 이 안 먹는다 — 토큰 예외.
const REFRESH_TINT = '#FF7800';

/**
 * 웹 `pages/home` 의 hero.
 *
 * 웹은 배너 SVG 를 좌우 폭에 따라 둘 중 하나만 보여주지만(모바일 폭에서는 위쪽 하나),
 * RN 은 한 벌만 둔다. 로고도 웹과 **같은 파일**을 번들해서 쓴다.
 */
function HomeBanner() {
  return (
    <View className="w-full items-center rounded-xl bg-[#144A7D] p-9">
      <MainBanner width={BANNER_WIDTH} height={BANNER_HEIGHT} />

      <View className="mt-6 w-full">
        <Text.lg className="mb-1 font-semibold text-white">모임이 좋았을 뿐인데,,,</Text.lg>
        <Text.xxl className="mb-2 font-semibold text-white">점점 부담이 되고 있다면?</Text.xxl>

        <View className="flex-row items-center gap-1">
          <OnsquadLogo width={LOGO_WIDTH} height={LOGO_HEIGHT} />
          <Text.lg className="font-semibold text-white">에 합류하세요!</Text.lg>
        </View>
      </View>
    </View>
  );
}

export function HomeContent({ navigation }: HomeContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useSuspenseInfiniteQuery(
    crewQueries.infiniteList(),
  );

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
        contentContainerClassName="p-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={REFRESH_TINT} />
        }
        ListHeaderComponent={
          <View className="mb-6">
            <HomeBanner />

            <View className="mt-6">
              <CrewListHeader onAddCrewPress={() => navigation.navigate('CrewNew')} />
            </View>
          </View>
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        renderItem={({ item }) => (
          <View className="mb-3">
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
