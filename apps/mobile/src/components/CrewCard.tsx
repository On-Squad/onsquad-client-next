import { Image, Pressable, Text, View } from 'react-native';

interface CrewCardProps {
  name: string;
  introduce: string;
  memberCount: number;
  imageUrl: string;
  onPress: () => void;
}

export function CrewCard({ name, introduce, memberCount, imageUrl, onPress }: CrewCardProps) {
  return (
    <Pressable onPress={onPress} className="mb-s-20 flex-row items-center gap-s-30 rounded-xl bg-white p-s-30">
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} className="h-16 w-16 rounded-lg" />
      ) : (
        <View className="h-16 w-16 rounded-lg bg-grayscale200" />
      )}

      <View className="flex-1">
        <Text className="text-100 font-semibold" numberOfLines={1}>
          {name}
        </Text>
        <Text className="mt-s-10 text-75 text-grayscale600" numberOfLines={1}>
          {introduce}
        </Text>
        <Text className="mt-s-10 text-75 text-grayscale600">멤버 {memberCount}명</Text>
      </View>
    </Pressable>
  );
}
