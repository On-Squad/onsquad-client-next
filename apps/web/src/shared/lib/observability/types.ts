// 앱 정보의 계약은 브릿지 패키지가 단일 출처다. 여기서 다시 정의하지 않는다.
export type { AppInfo } from '@onsquad/bridge';

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
