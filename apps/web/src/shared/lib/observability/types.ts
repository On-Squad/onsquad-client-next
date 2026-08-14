/**
 * RN 셸이 웹 로드 전에 주입하는 앱 정보. 일반 브라우저에서는 undefined.
 *
 * 이 객체는 앱과 맺은 계약이다. 스토어에 깔린 구버전 앱은 업데이트되지 않으므로
 * **필드는 추가만 하고 삭제·의미 변경을 하지 않는다.** (Phase 1 에서 methods 가 추가된다)
 */
export interface AppInfo {
  /** 계약 버전. 웹이 앱의 능력 범위를 판정하는 기준 */
  bridgeVersion: number;
  /** 앱 빌드 버전 (예: '1.2.0') */
  appVersion: string;
  os: 'ios' | 'android';
  /** 사용자가 이 화면을 요청한 시각(epoch ms). 웹뷰 생성 이전 구간을 재기 위한 0초 기준 */
  tapAt?: number;
  /** WebView 인스턴스가 생성된 시각(epoch ms) */
  webviewCreatedAt?: number;
}

/** 모든 리포트에 공통으로 붙는 실행 환경 태그. "재현이 안 되는" 버그를 좁히는 단서다. */
export interface RuntimeContext {
  isWebView: boolean;
  os: 'ios' | 'android' | 'web';
  /** 웹뷰가 아니면 null */
  appVersion: string | null;
  /** 웹뷰가 아니면 null */
  bridgeVersion: number | null;
  /** 웹 배포 식별자 (Vercel 커밋 SHA, 로컬은 'dev') */
  webVersion: string;
}

interface ReportBase {
  context: RuntimeContext;
  /** 발생 시각 (epoch ms) */
  at: number;
}

export type ErrorSource = 'onerror' | 'unhandledrejection' | 'manual';

export interface ErrorReport extends ReportBase {
  kind: 'error';
  name: string;
  message: string;
  stack?: string;
  source: ErrorSource;
  /**
   * 원본 에러. 직렬화된 필드만으로는 스택을 복원할 수 없어서 그대로 들려 보낸다.
   * 원격 전송 sink 는 이 값을 그대로 실어 보내면 안 된다 (JSON 이 아닐 수 있다).
   */
  error?: unknown;
}

export interface MetricReport extends ReportBase {
  kind: 'metric';
  name: string;
  durationMs: number;
  /** 구간별 분해값. 어느 칸이 몇 ms 인지 나눠 봐야 앱/웹 책임이 갈린다 */
  detail?: Record<string, number>;
}

export type Report = ErrorReport | MetricReport;

/**
 * 리포트가 흘러갈 목적지. 기본은 콘솔이고, Sentry 등을 붙일 때 이 인터페이스만 구현한다.
 * 관측이 앱을 죽이면 안 되므로 구현체는 절대 throw 하지 않는다.
 */
export interface Sink {
  send: (report: Report) => void;
}
