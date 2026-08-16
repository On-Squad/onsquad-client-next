/**
 * 요청에 실을 accessToken 을 어디서 얻을지 주입받는다.
 *
 * 브라우저는 BFF(`/api/bff`)가 서버 세션의 토큰을 대신 꽂아주므로 이 provider 가 필요 없다.
 * **RN 은 셸이 세션을 쥔다** — 셸이 여기에 조회 함수를 등록하면 `common.ts` 가 요청 시 꺼내 쓴다.
 * 웹뷰에 넘길 때는 브릿지의 `auth.getToken`(수명 짧은 토큰)을 쓴다. 장기 토큰은 웹으로 넘기지 않는다.
 *
 * `runtime.ts` · `timeoutNotifier.ts` 와 같은 자리에 두는 이유:
 * 셋 다 "common.ts 가 요청을 만들 때 필요한데 플랫폼마다 다른 것" 이다.
 */
export type AccessTokenProvider = () => string | undefined;

/** 등록 전에는 토큰 없이 요청한다 — 공개 API 는 그대로 동작해야 한다. */
let provide: AccessTokenProvider = () => undefined;

export const setAccessTokenProvider = (provider: AccessTokenProvider) => {
  provide = provider;
};

export const getProvidedAccessToken = (): string | undefined => {
  try {
    return provide();
  } catch {
    // 토큰을 못 꺼냈다고 요청 자체가 막히면 안 된다. 서버가 401 로 답하게 둔다.
    return undefined;
  }
};
