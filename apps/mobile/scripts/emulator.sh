#!/usr/bin/env bash
#
# Android 에뮬레이터 부팅 스크립트
#
# 사용법:
#   ./scripts/emulator.sh [AVD_NAME]
#   pnpm --filter @onsquad/mobile emulator
#
# - AVD 미지정 시 첫 번째 AVD 사용.
# - 이미 실행 중이면 재사용.
# - 백그라운드로 띄우고(detach) 부팅 완료까지 대기 → 스크립트가 끝나도 에뮬레이터는 유지된다.
#   (자신의 터미널에서 실행해야 세션과 독립적으로 살아 있습니다.)
#
set -euo pipefail

ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
EMULATOR="$ANDROID_HOME/emulator/emulator"
ADB="$ANDROID_HOME/platform-tools/adb"

if [ ! -x "$EMULATOR" ]; then
  echo "emulator 실행 파일을 찾을 수 없습니다: $EMULATOR" >&2
  echo "ANDROID_HOME 을 확인하세요 (현재: $ANDROID_HOME)" >&2
  exit 1
fi

# 이미 떠 있으면 재사용
if "$ADB" devices | grep -q 'emulator-[0-9]*[[:space:]]*device'; then
  echo "이미 실행 중인 에뮬레이터를 사용합니다."
  "$ADB" devices
  exit 0
fi

AVD="${1:-$("$EMULATOR" -list-avds | head -1)}"
if [ -z "$AVD" ]; then
  echo "사용 가능한 AVD 가 없습니다. Android Studio 에서 AVD 를 먼저 생성하세요." >&2
  exit 1
fi

echo "부팅: $AVD"
nohup "$EMULATOR" -avd "$AVD" -gpu auto > "/tmp/onsquad-emulator-${AVD}.log" 2>&1 &
disown

echo "부팅 대기 중..."
"$ADB" wait-for-device
until [ "$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
  sleep 2
done

echo "부팅 완료:"
"$ADB" devices

# 에뮬레이터의 localhost 는 에뮬레이터 자신이다. 호스트로 뚫어줘야 한다.
#
#   3000 — WebView 가 호스트 web dev 에 접근. localhost(보안 컨텍스트)를 써야
#          MSW Service Worker 등록이 된다.
#   8080 — RN 네이티브 화면이 백엔드 API 를 직접 호출한다(index.js 의
#          NEXT_PUBLIC_API_BASE_URL 기본값). 웹뷰 시절엔 웹이 BFF 로 갔으니 필요 없었지만
#          RN-first 로 오면서 필요해졌다. 없으면 화면이 조용히 에러 상태로 뜬다.
"$ADB" reverse tcp:3000 tcp:3000 || true
"$ADB" reverse tcp:8080 tcp:8080 || true
echo "adb reverse 설정됨: 3000(web dev) · 8080(backend API)"
echo "  web dev 서버: pnpm --filter web dev"
echo "  백엔드:       ~/Desktop/onsquad-back"
