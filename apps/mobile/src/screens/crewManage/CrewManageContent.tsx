import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSuspenseQuery } from '@tanstack/react-query';

import { crewQueries } from '../../entities/crew/api/crew.queries';
import { resolveManageRow } from '../../navigation/crewMembersRoute';
import type { RootStackParamList } from '../../navigation/types';
import { CountLabel } from '../../shared/ui/CountLabel';
import { NavButton, NavButtonLabel } from '../../shared/ui/NavButton';
import { Text } from '../../shared/ui/Text';

export type CrewManageContentProps = NativeStackScreenProps<RootStackParamList, 'CrewManage'>;

/** 아직 이관하지 않은 줄의 흐림 정도. 못 누른다는 것이 보여야 한다. */
const DISABLED_OPACITY = 0.4;

/**
 * 크루 관리 허브. 웹 `features/crew/manage/ui/CrewManageList` 의 미러.
 *
 * **줄 5개를 웹과 같이 그리되 이번에 동작하는 것은 "참가 신청" 하나다.**
 * 나머지를 지우지 않는 이유는 두 가지다 — 관리 화면의 전체 모양을 사용자가 알 수 있고,
 * 서버가 주는 카운트는 지금도 진짜라 보여줄 값이 있다.
 *
 * 비활성 줄은 `disabled` 로 **못 누르게** 한다. onPress 만 비우면 눌리는데 무반응이라
 * 고장으로 보인다.
 */
export function CrewManageContent({ route, navigation }: CrewManageContentProps) {
  const { crewId, crewName } = route.params;
  const insets = useSafeAreaInsets();
  const { data } = useSuspenseQuery(crewQueries.manage({ crewId }));

  const manage = data.data;

  return (
    <ScrollView
      className="flex-1 bg-grayscale100"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      contentContainerClassName="gap-2 p-5"
    >
      {manage.states.canModify ? (
        <View style={{ opacity: DISABLED_OPACITY }}>
          <NavButton disabled>
            <NavButtonLabel>크루정보 수정</NavButtonLabel>
          </NavButton>
        </View>
      ) : null}

      <NavButton
        onPress={() => {
          const target = resolveManageRow('participants', { crewId, crewName });
          if (target) navigation.navigate(target.screen, target.params);
        }}
      >
        <NavButtonLabel>참가 신청</NavButtonLabel>
        <CountLabel count={manage.requestCnt} />
      </NavButton>

      <View style={{ opacity: DISABLED_OPACITY }}>
        <NavButton disabled>
          <NavButtonLabel>스쿼드</NavButtonLabel>
          <CountLabel count={manage.squadCnt} />
        </NavButton>
      </View>

      <NavButton
        onPress={() => {
          const target = resolveManageRow('crewMembers', { crewId, crewName });
          if (target) navigation.navigate(target.screen, target.params);
        }}
      >
        <NavButtonLabel>크루원</NavButtonLabel>
        <CountLabel count={manage.memberCnt} />
      </NavButton>

      {manage.states.canDelete ? (
        <View className="items-center pt-10" style={{ opacity: DISABLED_OPACITY }}>
          <Text.sm className="text-grayscale500">크루 삭제</Text.sm>
        </View>
      ) : null}
    </ScrollView>
  );
}
