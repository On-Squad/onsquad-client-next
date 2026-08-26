import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronRight } from 'lucide-react-native';

import { crewQueries } from '../../entities/crew/api/crew.queries';
import { useAcceptCrewRequestMutation } from '../../features/crew/manage/participants/model/useAcceptCrewRequestMutation';
import { useRejectCrewRequestMutation } from '../../features/crew/manage/participants/model/useRejectCrewRequestMutation';
import type { RootStackParamList } from '../../navigation/types';
import { Avatar } from '../../shared/ui/Avatar';
import { Text } from '../../shared/ui/Text';

export type CrewParticipantsContentProps = NativeStackScreenProps<RootStackParamList, 'CrewParticipants'>;

// lucide 는 색·크기를 prop 으로 받는다 — className 대상이 아니다(토큰 예외). 웹 text-grayscale900 과 같다.
const CHEVRON_COLOR = '#1A1A1A';

const CHEVRON_SIZE = 24;

/**
 * 참가 신청자 목록. 웹 `features/crew/manage/participants/ui/ParticipantList` 의 미러.
 *
 * **첫 페이지(5명)만 보여준다.** 웹도 `useQuery` 로 첫 페이지만 받고 더보기가 없다 —
 * 웹의 한계를 그대로 옮긴다.
 *
 * `ChevronRight` 는 웹에도 onClick 이 없다. 모양만 옮기고 동작을 만들지 않는다.
 */
export function CrewParticipantsContent({ route }: CrewParticipantsContentProps) {
  const { crewId } = route.params;
  const insets = useSafeAreaInsets();
  const { data } = useSuspenseQuery(crewQueries.participants({ crewId }));

  const acceptRequest = useAcceptCrewRequestMutation(crewId);
  const rejectRequest = useRejectCrewRequestMutation(crewId);

  const participants = data.data.results;

  if (participants.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-grayscale100">
        <Text.sm className="text-grayscale500">참가 신청자가 없습니다</Text.sm>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-grayscale100"
      contentContainerStyle={{ paddingBottom: insets.bottom }}
      contentContainerClassName="gap-2 p-5"
      data={participants}
      keyExtractor={item => String(item.id)}
      renderItem={({ item }) => {
        // 한 행이 처리 중이면 그 행의 두 버튼을 함께 잠근다 — 웹과 같다.
        const isRowBusy =
          (acceptRequest.isPending && acceptRequest.variables === item.id) ||
          (rejectRequest.isPending && rejectRequest.variables === item.id);

        return (
          <View className="flex-col gap-2 rounded-xl bg-white p-3">
            <View className="flex-row items-center gap-2">
              <Avatar className="h-6 w-6" />
              <Text.sm className="font-medium text-grayscale900">{item.requester.nickname}</Text.sm>
            </View>

            <View className="flex-row items-center justify-between">
              <Text.sm className="flex-1 text-grayscale900">{item.requester.introduce}</Text.sm>
              <ChevronRight size={CHEVRON_SIZE} color={CHEVRON_COLOR} />
            </View>

            <View className="flex-row items-center justify-between">
              <Text.xs className="text-grayscale500">
                {dayjs(item.requestAt).format('YYYY년 MM월 DD일')}
              </Text.xs>

              <View className="flex-row items-center gap-1">
                <Pressable
                  disabled={isRowBusy}
                  onPress={() => rejectRequest.mutate(item.id)}
                  className="rounded-full bg-primary50 px-3 py-1"
                >
                  <Text.sm className="font-medium text-primary700">거절</Text.sm>
                </Pressable>
                <Pressable
                  disabled={isRowBusy}
                  onPress={() => acceptRequest.mutate(item.id)}
                  className="rounded-full bg-primary50 px-3 py-1"
                >
                  <Text.sm className="font-medium text-primary700">수락</Text.sm>
                </Pressable>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}
