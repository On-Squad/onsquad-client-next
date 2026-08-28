import { useMemo, useRef, type ComponentRef } from 'react';
import { View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';

import { announceDetailUrl } from '../../entities/crew/lib/announceWebUrl';
import { createShellTokenGrant } from '../../auth/shellTokenGrant';
import { useAndroidHardwareBack } from '../../hooks/useAndroidHardwareBack';
import { useAppInfoScript } from '../../hooks/useAppInfoScript';
import { useBackGesture } from '../../hooks/useBackGesture';
import { useBridgeMessages } from '../../hooks/useBridgeMessages';
import {
  resolveAnnouncePushIntent,
  resolveAnnounceReplaceIntent,
  type AnnounceShellIntent,
} from '../../navigation/announceShellRoute';
import { useWebViewLoading } from '../../hooks/useWebViewLoading';
import { pickImageStub } from '../../shared/lib/pickImageStub';
import type { RootStackParamList } from '../../navigation/types';

export type AnnounceDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'AnnounceDetail'>;

/**
 * 공지 상세 웹뷰 화면.
 *
 * RN 헤더 제목은 "공지사항" 으로 고정한다.
 * 웹 CrewDetailAppbar 는 크루명을 쓰지만 RN 헤더는 전환 즉시 그려져야 해서
 * 웹뷰가 크루명을 알려줄 때까지 기다릴 수 없다. 화면 성격("공지사항")을 쓴다.
 * (RootNavigator 에서 options 로 확정된다)
 *
 * 웹뷰가 로드할 URL 은 NEXT_PUBLIC_WEB_ORIGIN 환경변수로 개발/배포를 전환한다.
 * 개발: http://localhost:3000, 배포: 실제 도메인.
 */
export function AnnounceDetailScreen({ route, navigation }: AnnounceDetailScreenProps) {
  const { crewId, crewName, announceId, url: urlOverride } = route.params;

  const { showSkeleton, onLoadStart, onLoad } = useWebViewLoading();
  const webRef = useRef<ComponentRef<typeof WebView> | null>(null);
  const appInfoScript = useAppInfoScript();
  const { backGestureEnabled, setBackGestureEnabled, handleMessage: handleLegacyMessage } = useBackGesture();
  const { onNavigationStateChange } = useAndroidHardwareBack(webRef);

  // 화면을 떠나면 토큰 발급 기록을 지운다.
  // 다음 웹뷰는 자기 첫 요청을 "처음 묻는 것"으로 시작해야 한다 —
  // 남의 기록을 물려받으면 멀쩡한 토큰을 만료로 오해해 갱신을 한 번 더 태운다.
  // **발급 기록은 이 화면 안에 갇힌다.** 화면마다 새 웹뷰가 뜨고 각자 한 번씩 토큰을 묻는데,
  // 기록이 전역이면 두 번째 화면의 정상 요청이 "만료 재요청"으로 오판돼 갱신이 돈다(실측).
  const grantToken = useMemo(() => createShellTokenGrant(), []);

  /** 매핑된 동작을 실제 스택에 반영한다. 매핑이 없으면(null) 아무 화면도 쌓지 않는다. */
  const applyIntent = (intent: AnnounceShellIntent | null): boolean => {
    if (!intent) {
      return false;
    }

    if (intent.screen === 'AnnounceList') {
      navigation.navigate('AnnounceList', intent.params);

      return true;
    }

    if (intent.action === 'replace') {
      navigation.replace('AnnounceDetail', intent.params);

      return true;
    }

    navigation.push('AnnounceDetail', intent.params);

    return true;
  };

  const handleMessage = useBridgeMessages({
    webRef,
    onReady: () => {},
    onBackGestureChange: setBackGestureEnabled,
    onLegacyMessage: handleLegacyMessage,
    // 경로 → 스택 동작 매핑은 announceShellRoute 가 쥔다.
    // 매핑되지 않는 경로면 null 이 오고, false 를 돌려주면 브릿지가 실패 응답을 보낸다.
    onShellPush: (path) => applyIntent(resolveAnnouncePushIntent(path, { crewName })),
    onShellReplace: (path) => applyIntent(resolveAnnounceReplaceIntent(path, { crewName })),
    // 만료된 토큰을 다시 물어오면 셸이 갱신해 새 토큰을 건넨다 — grantShellAccessToken 참고.
    onAuthGetToken: grantToken,
    // 고정 더미 URI — 실제 네이티브 피커·미디어 권한 없음(pickImageStub 참고).
    onMediaPickImage: pickImageStub,
  });

  // url 이 명시되면 그 주소를 로드하고, 없으면 crewId + announceId 로 구성한다.
  // 작성(write)·수정(edit) 화면은 announceId 가 없거나 경로가 다르므로 url 을 직접 넘긴다.
  const uri = urlOverride ?? announceDetailUrl({ crewId, announceId: announceId ?? 0 });

  return (
    <View className="flex-1">
      <WebView
        ref={webRef}
        source={{ uri }}
        injectedJavaScriptBeforeContentLoaded={appInfoScript}
        onMessage={({ nativeEvent }) => handleMessage(nativeEvent.data)}
        onNavigationStateChange={onNavigationStateChange}
        allowsBackForwardNavigationGestures={backGestureEnabled}
        onLoadStart={onLoadStart}
        onLoad={onLoad}
      />
      {showSkeleton && <AnnounceWebViewSkeleton />}
    </View>
  );
}

/** 웹뷰가 로드되는 동안 흰 화면 대신 보여주는 스켈레톤. */
function AnnounceWebViewSkeleton() {
  return (
    <View className="absolute inset-0 bg-white px-5 py-6 gap-3">
      {/* 제목 */}
      <View className="h-6 rounded bg-grayscale200 w-3/4" />
      {/* 작성자·날짜 메타 */}
      <View className="h-4 rounded bg-grayscale200 w-2/5 mt-1" />
      {/* 본문 줄 */}
      <View className="h-4 rounded bg-grayscale200 w-full mt-4" />
      <View className="h-4 rounded bg-grayscale200 w-full" />
      <View className="h-4 rounded bg-grayscale200 w-4/5" />
      <View className="h-4 rounded bg-grayscale200 w-full" />
      <View className="h-4 rounded bg-grayscale200 w-3/5" />
    </View>
  );
}
