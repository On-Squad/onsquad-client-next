/**
 * 웹 ↔ 네이티브 계약.
 *
 * ## 이 파일을 고치기 전에 읽을 것
 *
 * 브릿지는 우리가 만든 라이브러리가 아니라 **공개 API** 다.
 * 웹은 배포하면 모두가 최신이지만, 앱은 사용자가 업데이트를 눌러야 최신이다.
 * 그래서 현장에는 항상 "최신 웹 + 1년 전 앱" 조합이 존재한다.
 *
 * 규칙 — **추가만 한다. 삭제하지 않는다. 시그니처를 바꾸지 않는다.**
 * 모양을 바꿔야 하면 `media.pickImage.v2` 처럼 새 메서드를 추가하고 옛 것은 남긴다.
 * 이걸 어기면 스토어에 깔린 앱에서 조용히 깨지고, 우리는 그 앱을 고칠 수 없다.
 */

/** 계약 버전. 필드/메서드를 추가할 때가 아니라, 와이어 포맷 자체가 바뀔 때만 올린다. */
export const BRIDGE_VERSION = 1;

/**
 * 웹이 네이티브에 요청할 수 있는 것.
 *
 * 여기 선언되어 있다고 앱이 지원한다는 뜻은 아니다.
 * 실제 지원 여부는 앱이 주입한 {@link AppInfo.methods} 로 판정한다(`can()`).
 */
export interface BridgeMap {
  // ── 셸 제어 ────────────────────────────────────────────────
  /** 웹 준비 완료. 네이티브 스플래시를 내린다. (구 `APP_READY`) */
  'shell.ready': { req: void; res: void };
  /**
   * 화면에 보여줄 내용까지 준비됐다. 셸이 스켈레톤을 내리는 신호다.
   *
   * `shell.ready` 와 다르다 — 그건 "웹 JS 가 떴다" 이고, 이건 "그릴 것을 다 받았다" 이다.
   * 둘을 같이 쓰면 데이터 없는 껍데기가 먼저 보였다가 내용이 튀어 들어온다.
   */
  'shell.contentReady': { req: void; res: void };
  /** 이 웹뷰를 닫아달라. 웹 히스토리가 없을 때 쓴다. */
  'shell.close': { req: void; res: void };
  /** 네이티브 스택에 화면을 쌓아달라. */
  'shell.push': { req: { path: string }; res: void };
  /** 현재 화면을 스택에 쌓지 않고 교체한다 — 글쓰기 후 상세로 replace 할 때 쓴다. */
  'shell.replace': { req: { path: string }; res: void };
  /** iOS 엣지 스와이프 뒤로가기 허용 여부. (구 `NATIVE_BACK:on|off`) */
  'shell.setBackGesture': { req: { enabled: boolean }; res: void };

  // ── 권한 · 디바이스 (Phase 2) ──────────────────────────────
  'media.pickImage': { req: { max: number }; res: { uris: string[] } };
  'media.takePhoto': { req: void; res: { uri: string } };
  'permission.request': {
    req: { kind: 'camera' | 'photo' | 'notification' };
    res: { granted: boolean };
  };
  'push.getToken': { req: void; res: { token: string | null } };

  // ── 세션 ───────────────────────────────────────────────────
  /** 앱이 들고 있는 수명 짧은 토큰. 장기 토큰은 절대 웹으로 넘기지 않는다. */
  'auth.getToken': { req: void; res: { accessToken: string; expiresAt: number } };

  // ── 부가 ───────────────────────────────────────────────────
  'share.url': { req: { url: string; title?: string }; res: { ok: boolean } };
  'haptic.impact': { req: { style: 'light' | 'medium' | 'heavy' }; res: void };
}

export type BridgeMethod = keyof BridgeMap;
export type BridgeRequest<M extends BridgeMethod> = BridgeMap[M]['req'];
export type BridgeResponse<M extends BridgeMethod> = BridgeMap[M]['res'];

/** 네이티브가 웹에 일방적으로 알리는 것. 응답이 없다. */
export interface NativeEventMap {
  /**
   * 백그라운드에서 돌아왔다.
   * 웹뷰는 메모리 부족 시 OS 가 콘텐츠 프로세스를 통째로 죽인다 —
   * 껍데기는 남고 안이 비는 "조용한 흰 화면"이라 에러로도 안 잡힌다.
   * 복귀 시 화면이 비었으면 다시 로드하는 판단에 쓴다.
   */
  'app.resume': { restoredAt: number };
  'app.background': void;
  /** 같은 탭을 다시 눌렀다. 목록을 맨 위로 올리는 등에 쓴다. */
  'tab.reselect': { tab: string };
  /** iOS 는 키보드가 올라와도 레이아웃이 안 줄어든다. 가려진 높이를 알려준다. */
  'keyboard.height': { height: number };
}

export type NativeEventName = keyof NativeEventMap;
export type NativeEventPayload<E extends NativeEventName> = NativeEventMap[E];

/**
 * 앱이 콘텐츠 로드 전에 주입하는 정보. 일반 브라우저에서는 undefined.
 *
 * `methods` 를 `BridgeMethod[]` 가 아니라 `string[]` 으로 둔 것은 의도적이다 —
 * 구버전 앱이 보내는 값은 우리가 지금 아는 목록과 다를 수 있는 **런타임 데이터**다.
 * 타입 안전은 앱이 이 배열을 만드는 쪽({@link SUPPORTED_METHODS})에서 잡는다.
 */
export interface AppInfo {
  bridgeVersion: number;
  appVersion: string;
  os: 'ios' | 'android';
  methods: readonly string[];
  /** 사용자가 이 화면을 요청한 시각(epoch ms). 시작 성능 계측의 0초 기준. */
  tapAt?: number;
  /** WebView 인스턴스가 생성된 시각(epoch ms) */
  webviewCreatedAt?: number;
}

/** 응답을 기다리는 기본 한계. 답이 영영 안 오면 무한 스피너가 된다. */
export const DEFAULT_TIMEOUT_MS = 3_000;

/**
 * 기본값으로는 부족한 메서드.
 * 권한 다이얼로그나 피커는 **사용자가 화면을 보고 있는 시간**이라 초 단위로 예측할 수 없다.
 */
export const METHOD_TIMEOUT_MS: Partial<Record<BridgeMethod, number>> = {
  'media.pickImage': 120_000,
  'media.takePhoto': 120_000,
  'permission.request': 60_000,
  'share.url': 60_000,
  'push.getToken': 15_000,
};
