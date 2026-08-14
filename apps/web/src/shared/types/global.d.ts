declare global {
  interface Window {
    daum: any;
  }
}

// ReactNativeWebView / __ONSQUAD_APP__ / __onNative 는 @onsquad/bridge 가 선언한다.
// 여기서 다시 선언하면 두 벌이 되어 한쪽만 고쳤을 때 조용히 어긋난다.

export {};
