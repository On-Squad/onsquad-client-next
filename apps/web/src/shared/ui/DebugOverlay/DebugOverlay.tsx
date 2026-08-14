'use client';

import { useState } from 'react';

import { getRecentReports, getRuntimeContext } from '@/shared/lib/observability';
import type { Report } from '@/shared/lib/observability';

/** 이 횟수만큼 좌상단을 연속으로 눌러야 열린다. 실사용자가 우연히 여는 일이 없을 정도. */
const TAP_COUNT = 7;
/** 연속 탭으로 인정하는 간격. 넘으면 처음부터 다시 센다. */
const TAP_WINDOW_MS = 500;

const formatReport = (report: Report) => {
  const time = new Date(report.at).toISOString().slice(11, 23);

  if (report.kind === 'error') {
    return `${time}  [${report.source}] ${report.name}: ${report.message}`;
  }

  const detail = Object.entries(report.detail ?? {})
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

  return `${time}  ${report.name} ${report.durationMs}ms  ${detail}`;
};

/**
 * 릴리즈 빌드 웹뷰에는 F12 도 원격 디버깅도 없다.
 * 화면 위에 콘솔을 띄우는 것 말고는 사용자 기기에서 로그를 볼 방법이 없어서 둔다.
 *
 * 좌상단 히트 영역을 {@link TAP_COUNT}번 연속으로 눌러야 열린다.
 */
export function DebugOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [taps, setTaps] = useState({ count: 0, at: 0 });

  const handleSecretTap = () => {
    const now = Date.now();
    const count = now - taps.at < TAP_WINDOW_MS ? taps.count + 1 : 1;

    if (count >= TAP_COUNT) {
      setTaps({ count: 0, at: 0 });
      setIsOpen(true);

      return;
    }

    setTaps({ count, at: now });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={handleSecretTap}
        className="fixed left-0 top-0 z-[9999] h-10 w-10 opacity-0"
      />
    );
  }

  const context = getRuntimeContext();
  const reports = getRecentReports();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-grayscale900/95 p-s-40 pt-[calc(1rem+env(safe-area-inset-top))] text-100 text-white">
      <div className="flex items-center justify-between">
        <span className="font-bold">디버그</span>
        <button type="button" onClick={() => setIsOpen(false)} className="px-s-20 py-s-10">
          닫기
        </button>
      </div>

      <pre className="mt-s-20 shrink-0 whitespace-pre-wrap break-all text-75 text-grayscale300">
        {JSON.stringify(context, null, 2)}
      </pre>

      <div className="mt-s-20 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {reports.length === 0 ? (
          <p className="text-grayscale400">수집된 리포트가 없습니다.</p>
        ) : (
          reports
            .slice()
            .reverse()
            .map((report, index) => (
              <p key={`${report.at}-${index}`} className="whitespace-pre-wrap break-all py-s-10 text-75">
                {formatReport(report)}
              </p>
            ))
        )}
      </div>
    </div>
  );
}
