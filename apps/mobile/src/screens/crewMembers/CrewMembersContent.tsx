import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { MoreVertical } from 'lucide-react-native';

import type { CrewMemberItem } from '../../entities/crew/api/crewMembersGetFetch';
import { crewQueries } from '../../entities/crew/api/crew.queries';
import { resolveMbtiDisplay } from '../../features/crew/manage/members/lib/resolveMbtiDisplay';
import { useDelegateCrewOwnerMutation } from '../../features/crew/manage/members/model/useDelegateCrewOwnerMutation';
import { useKickCrewMemberMutation } from '../../features/crew/manage/members/model/useKickCrewMemberMutation';
import type { RootStackParamList } from '../../navigation/types';
import { Alert, ALERT_BUTTON, alertButtonText } from '../../shared/ui/Alert';
import { Avatar } from '../../shared/ui/Avatar';
import { BottomSheet } from '../../shared/ui/BottomSheet';
import { Text } from '../../shared/ui/Text';

export type CrewMembersContentProps = NativeStackScreenProps<RootStackParamList, 'CrewMembers'>;

// lucide 는 색을 prop 으로 받는다 — className 대상이 아니다(토큰 예외). 웹 text-grayscale500 과 같다.
const MORE_ICON_COLOR = '#A3A3A3';

const MORE_ICON_SIZE = 20;



// 웹 BottomSheet → Alert 전환 애니메이션 시간. 웹 OVERLAY_ANIMATION_DURATION 과 같다.
const SHEET_CLOSE_DELAY_MS = 200;

type MenuState =
  | { kind: 'closed' }
  | { kind: 'menu'; item: CrewMemberItem }
  | { kind: 'profile'; item: CrewMemberItem }
  | { kind: 'confirmKick'; item: CrewMemberItem }
  | { kind: 'confirmDelegate'; item: CrewMemberItem };

/**
 * 크루원 목록. 웹 `features/crew/manage/members/ui/CrewMemberList` 의 RN 미러.
 *
 * **역할 뱃지를 그리지 않는다.** 서버 응답 `states` 에 role 이 없어 표시할 근거가 없다.
 * 누가 무엇을 할 수 있는지는 `states(isMe·canKick·canDelegateOwner)` 만으로 판단한다 —
 * 화면이 역할 규칙을 다시 계산하지 않는다.
 */
export function CrewMembersContent({ route }: CrewMembersContentProps) {
  const { crewId } = route.params;
  const insets = useSafeAreaInsets();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    crewQueries.members({ crewId }),
  );

  const kickMutation = useKickCrewMemberMutation(crewId);
  const delegateMutation = useDelegateCrewOwnerMutation(crewId);

  const [menu, setMenu] = useState<MenuState>({ kind: 'closed' });

  const members = data?.pages.flatMap((page) => page.data.results) ?? [];
  const totalCount = data?.pages[0]?.data.totalCount ?? 0;
  const totalPages = data?.pages[0]?.data.totalPages ?? 0;
  const loadedPages = data?.pages.length ?? 0;

  const closeMenu = () => setMenu({ kind: 'closed' });

  const openMenu = (item: CrewMemberItem) => setMenu({ kind: 'menu', item });
  const openProfile = (item: CrewMemberItem) => setMenu({ kind: 'profile', item });

  const startKickFlow = (item: CrewMemberItem) => {
    closeMenu();
    setTimeout(() => setMenu({ kind: 'confirmKick', item }), SHEET_CLOSE_DELAY_MS);
  };
  const startDelegateFlow = (item: CrewMemberItem) => {
    closeMenu();
    setTimeout(() => setMenu({ kind: 'confirmDelegate', item }), SHEET_CLOSE_DELAY_MS);
  };

  if (members.length === 0 && !isFetchingNextPage) {
    return (
      <View className="flex-1 items-center justify-center bg-grayscale100">
        <Text.sm className="text-grayscale500">크루원이 없습니다</Text.sm>
      </View>
    );
  }

  return (
    <>
      <FlatList
        className="flex-1 bg-grayscale100"
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        contentContainerClassName="gap-2 p-5"
        data={members}
        keyExtractor={(item) => String(item.member.id)}
        ListHeaderComponent={
          <Text.sm className="font-semibold text-grayscale900">크루원 {totalCount}명</Text.sm>
        }
        renderItem={({ item }) => {
          const canManage = !item.states.isMe && (item.states.canKick || item.states.canDelegateOwner);

          return (
            /**
              **카드 전체가 프로필로 가는 버튼이다.** 웹도 같다.
              처음엔 소개 줄 오른쪽에 `>` 를 두고 그 줄만 눌리게 했는데,
              화살표 없이 카드를 누르는 편이 손가락으로 쓰기 쉬워 양쪽 다 이렇게 바꿨다.
              `⋮` 는 안쪽 Pressable 이라 자기 탭을 먼저 가져간다 — 관리 메뉴는 그대로 열린다.
            */
            <Pressable
              className="flex-col gap-2 rounded-xl bg-white p-3"
              accessibilityLabel={`${item.member.nickname} 님 프로필`}
              onPress={() => openProfile(item)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Avatar className="h-6 w-6" />
                  <Text.sm className="font-medium text-grayscale900">{item.member.nickname}</Text.sm>
                </View>
                {canManage && (
                  <Pressable
                    accessibilityLabel={`${item.member.nickname} 님 관리`}
                    onPress={() => openMenu(item)}
                    hitSlop={8}
                  >
                    <MoreVertical size={MORE_ICON_SIZE} color={MORE_ICON_COLOR} />
                  </Pressable>
                )}
              </View>

              <Text.sm className="text-grayscale900">{item.member.introduce}</Text.sm>
            </Pressable>
          );
        }}
        ListFooterComponent={
          hasNextPage ? (
            /* 크루 홈의 공지 "더보기" 와 같은 담백한 텍스트 버튼이다. */
            <View className="items-center py-2">
              <Pressable onPress={() => fetchNextPage()} disabled={isFetchingNextPage} hitSlop={8}>
                <Text.xs className="text-grayscale500">
                  더보기 {loadedPages}/{totalPages}
                </Text.xs>
              </Pressable>
            </View>
          ) : null
        }
      />

      {/* 관리 메뉴 시트 */}
      <BottomSheet
        title={menu.kind === 'menu' ? `${menu.item.member.nickname} 님` : ''}
        isOpen={menu.kind === 'menu'}
        onClose={closeMenu}
      >
        {menu.kind === 'menu' && (
          <View className="gap-2">
            {menu.item.states.canDelegateOwner && (
              <Pressable
                className="items-start px-2 py-3"
                onPress={() => startDelegateFlow(menu.item)}
              >
                <Text.sm>크루장 위임</Text.sm>
              </Pressable>
            )}
            {menu.item.states.canKick && (
              <Pressable
                className="items-start px-2 py-3"
                onPress={() => startKickFlow(menu.item)}
              >
                <Text.sm>강퇴</Text.sm>
              </Pressable>
            )}
          </View>
        )}
      </BottomSheet>

      {/* 프로필 시트 */}
      <BottomSheet
        title="프로필"
        isOpen={menu.kind === 'profile'}
        onClose={closeMenu}
      >
        {menu.kind === 'profile' && (
          <View className="gap-4">
            <View className="gap-2 rounded-xl bg-grayscale50 p-3">
              <View className="flex-row items-center gap-2">
                <Avatar className="h-6 w-6" />
                <Text.sm className="font-medium text-grayscale900">{menu.item.member.nickname}</Text.sm>
              </View>
              <Text.sm className="text-grayscale900">{menu.item.member.introduce}</Text.sm>
            </View>

            <View className="flex-row items-center justify-between">
              <Text.sm className="text-grayscale500">MBTI</Text.sm>
              <Text.sm className="font-medium text-grayscale900">
                {resolveMbtiDisplay(menu.item.member.mbti)}
              </Text.sm>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* 강퇴 확인 알럿 */}
      <Alert
        isOpen={menu.kind === 'confirmKick'}
        onClose={closeMenu}
        title="크루원을 강퇴할까요?"
        buttonSlot={
          menu.kind === 'confirmKick' ? (
            <View className="flex-row">
              <Pressable className={ALERT_BUTTON.CANCEL} onPress={closeMenu}>
                <Text.lg className={alertButtonText('cancel')}>취소</Text.lg>
              </Pressable>
              <Pressable
                className={ALERT_BUTTON.ACTION}
                onPress={() => {
                  closeMenu();
                  kickMutation.mutate(menu.item.member.id);
                }}
              >
                <Text.lg className={alertButtonText('action')}>강퇴</Text.lg>
              </Pressable>
            </View>
          ) : undefined
        }
      >
        {menu.kind === 'confirmKick' ? (
          <Text.sm className="text-center text-grayscale900">
            {menu.item.member.nickname} 님을 크루에서 강퇴합니다.
          </Text.sm>
        ) : null}
      </Alert>

      {/* 크루장 위임 확인 알럿 */}
      <Alert
        isOpen={menu.kind === 'confirmDelegate'}
        onClose={closeMenu}
        title={
          menu.kind === 'confirmDelegate'
            ? `${menu.item.member.nickname} 님에게 크루장을 위임할까요?`
            : ''
        }
        buttonSlot={
          menu.kind === 'confirmDelegate' ? (
            <View className="flex-row">
              <Pressable className={ALERT_BUTTON.CANCEL} onPress={closeMenu}>
                <Text.lg className={alertButtonText('cancel')}>취소</Text.lg>
              </Pressable>
              <Pressable
                className={ALERT_BUTTON.ACTION}
                onPress={() => {
                  closeMenu();
                  delegateMutation.mutate(menu.item.member.id);
                }}
              >
                <Text.lg className={alertButtonText('action')}>위임</Text.lg>
              </Pressable>
            </View>
          ) : undefined
        }
      >
        {menu.kind === 'confirmDelegate' ? (
          <Text.sm className="text-center text-grayscale900">
            {menu.item.member.nickname} 님에게 크루장 권한을 위임합니다.
          </Text.sm>
        ) : null}
      </Alert>
    </>
  );
}
