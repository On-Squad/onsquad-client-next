import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';

import { SvgUri } from 'react-native-svg';

import { cn } from '../../lib/utils';

import NoProfile from '../../../assets/icons/no_profile.svg';

interface AvatarProps {
  imageUrl?: string;
  className?: string;
}

/** 원격 이미지가 SVG 면 `Image` 가 못 그린다 — 확장자로 갈라 `SvgUri` 를 쓴다. */
const isSvgUrl = (url: string): boolean => url.split('?')[0].toLowerCase().endsWith('.svg');

/**
 * 웹 `shared/ui/Avatar` 의 RN 미러.
 *
 * 세 갈래다.
 *   1. `imageUrl` 없음        → 번들된 no_profile (웹의 `/icons/no_profile.svg` 와 **같은 파일**)
 *   2. `imageUrl` 이 `.svg`   → `SvgUri`. 웹 `<img>` 는 SVG URL 을 그리지만 RN `Image` 는 못 그린다
 *   3. 그 외                  → `Image`
 *
 * **로드에 실패하면 1번으로 떨어진다.** 웹은 shadcn `AvatarFallback` 이 이 자리를 맡는다 —
 * 처음엔 "로컬 번들이라 실패하지 않는다"고 보고 안 옮겼는데, 원격 URL 이 들어오면 얘기가 다르다.
 * 실제로 시드의 프로필 이미지(CloudFront)가 죽어 있어 아바타가 통째로 비고 개발 모드에서
 * 에러 배너까지 떴다 — 에뮬레이터에서 실측했다.
 */
export function Avatar({ imageUrl, className }: AvatarProps) {
  const shape = cn('h-10 w-10 overflow-hidden rounded-full', className);
  const [hasFailed, setHasFailed] = useState(false);

  // 다른 사용자의 아바타로 바뀌면 실패 상태를 초기화한다. 안 하면 한 번 실패한 뒤 계속 폴백만 나온다.
  useEffect(() => setHasFailed(false), [imageUrl]);

  if (!imageUrl || hasFailed) {
    return (
      <View className={shape}>
        <NoProfile width="100%" height="100%" />
      </View>
    );
  }

  if (isSvgUrl(imageUrl)) {
    return (
      <View className={shape}>
        <SvgUri uri={imageUrl} width="100%" height="100%" onError={() => setHasFailed(true)} />
      </View>
    );
  }

  return <Image source={{ uri: imageUrl }} className={shape} onError={() => setHasFailed(true)} />;
}
