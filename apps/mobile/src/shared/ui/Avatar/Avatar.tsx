import { Image, View } from 'react-native';

import { cn } from '@/shared/lib/utils';

interface AvatarProps {
  imageUrl?: string;
  className?: string;
}

/**
 * 웹 `shared/ui/Avatar` 의 RN 미러.
 *
 * 웹은 이미지가 없으면 `/icons/no_profile.svg` 를 쓰지만 **RN 은 웹 public 경로를 볼 수 없다.**
 * SVG 에셋 파이프라인(`react-native-svg-transformer`)을 열지 않기로 했으므로 회색 원을 그린다.
 * 웹의 `AvatarFallback` 글자('U')도 옮기지 않는다 — 회색 원이 더 조용하다.
 */
export function Avatar({ imageUrl, className }: AvatarProps) {
  const shape = cn('h-10 w-10 overflow-hidden rounded-full bg-grayscale200', className);

  if (!imageUrl) {
    return <View className={shape} />;
  }

  return <Image source={{ uri: imageUrl }} className={shape} />;
}
