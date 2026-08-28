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
export type AccessTokenProvider = () => string | undefined | Promise<string | undefined>;

/** 등록 전에는 토큰 없이 요청한다 — 공개 API 는 그대로 동작해야 한다. */
let provide: AccessTokenProvider = () => undefined;

export const setAccessTokenProvider = (provider: AccessTokenProvider) => {
  provide = provider;
};

/**
 * **Promise 를 돌려주는 provider 를 허용한다.**
 * 웹뷰는 토큰을 브릿지로 받아오므로 등록 시점에는 값이 아직 없다.
 * 동기로만 읽으면 화면의 첫 요청이 토큰 없이 나가 401 을 맞는다 —
 * 공지 상세가 "작성된 내용이 없습니다"로 보이던 원인이 이것이었다(실측).
 * 등록만 먼저 해두고 여기서 기다리면 그 틈이 사라진다.
 */
export const getProvidedAccessToken = async (): Promise<string | undefined> => {
  try {
    return await provide();
  } catch {
    // 토큰을 못 꺼냈다고 요청 자체가 막히면 안 된다. 서버가 401 로 답하게 둔다.
    return undefined;
  }
};
