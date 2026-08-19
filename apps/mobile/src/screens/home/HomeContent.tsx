import { FlatList, Pressable, View } from 'react-native';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSuspenseQuery } from '@tanstack/react-query';

import MainBanner from '../../assets/images/main_banner.svg';
import OnsquadLogo from '../../assets/icons/onsquad_logo.svg';
import { crewQueries } from '../../entities/crew/api/crew.queries';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import { PullToRefresh } from '../../shared/ui/PullToRefresh';
import { Text } from '../../shared/ui/Text';
import {
  CrewListCard,
  CrewListHeader,
  type CrewListItem,
} from '../../widgets/CrewList';

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
        <Text.lg className="mb-1 font-semibold text-white">
          모임이 좋았을 뿐인데,,,
        </Text.lg>
        <Text.xxl className="mb-2 font-semibold text-white">
          점점 부담이 되고 있다면?
        </Text.xxl>

        <View className="flex-row items-center gap-1">
          <OnsquadLogo width={LOGO_WIDTH} height={LOGO_HEIGHT} />
          <Text.lg className="font-semibold text-white">에 합류하세요!</Text.lg>
        </View>
      </View>
    </View>
  );
}

/**
 * 홈 탭.
 *
 * **무한스크롤이 아니다.** 웹 `pages/home/ui/HomeCrewList` 는 `crewQueries.list()` 로
 * 첫 페이지만 보여주고, 목록 아래의 "모집중인 크루 더 보러가기" 로 크루 탐색으로 넘긴다.
 * 무한스크롤은 크루 탐색(`screens/crewList`)의 몫이다.
 */
export function HomeContent({ navigation }: HomeContentProps) {
  const { data, refetch } = useSuspenseQuery(crewQueries.list());

  const crews = (data?.results ?? []) as CrewListItem[];

  return (
    <View className="flex-1 bg-grayscale100">
      <PullToRefresh onRefresh={refetch}>
        {scrollProps => (
          <FlatList
            {...scrollProps}
            data={crews}
            keyExtractor={item => String(item.id)}
            contentContainerClassName="p-5"
            ListHeaderComponent={
              <View className="mb-6">
                <HomeBanner />

                <View className="mt-6">
                  <CrewListHeader
                    onAddCrewPress={() => navigation.navigate('CrewNew')}
                  />
                </View>
              </View>
            }
            ListFooterComponent={
              // 웹 widgets/CrewList 의 `flex justify-center pb-12` + ghost 버튼.
              <View className="items-center pb-12 pt-2">
                <Pressable
                  className="p-2"
                  onPress={() => navigation.navigate('Community')}
                >
                  <Text.sm className="font-semibold text-grayscale500">
                    모집중인 크루 더 보러가기
                  </Text.sm>
                </Pressable>
              </View>
            }
            renderItem={({ item }) => (
              <View className="mb-3">
                <CrewListCard
                  crew={item}
                  onPress={() =>
                    navigation.navigate('CrewDetail', {
                      crewId: item.id,
                      crewName: item.name,
                    })
                  }
                />
              </View>
            )}
          />
        )}
      </PullToRefresh>
    </View>
  );
}
