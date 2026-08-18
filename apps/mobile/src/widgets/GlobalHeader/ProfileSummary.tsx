import { View } from 'react-native';

import { Avatar } from '../../shared/ui/Avatar';
import { Text } from '../../shared/ui/Text';

interface ProfileSummaryProps {
  nickname?: string;
  profileImage?: string;
}

/**
 * 웹 `shared/ui/Profile` 의 RN 미러.
 *
 * 웹은 `session?.profileImage || '/icons/default_profile.svg'` 를 Avatar 에 넘긴다.
 * RN 은 `imageUrl` 이 없으면 Avatar 가 번들된 no_profile 을 그린다 — 같은 자리를 채운다.
 */
export function ProfileSummary({ nickname, profileImage }: ProfileSummaryProps) {
  return (
    <View className="flex-col items-center justify-center gap-6">
      <Avatar imageUrl={profileImage} className="h-12 w-12" />

      {nickname ? (
        <Text.base className="text-center">{nickname}</Text.base>
      ) : (
        <Text.base>로그인 후 이용해주세요!</Text.base>
      )}
    </View>
  );
}
