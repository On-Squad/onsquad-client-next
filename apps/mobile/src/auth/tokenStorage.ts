import * as Keychain from 'react-native-keychain';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Keychain 항목을 구분하는 이름. 앱 안에서 유일하면 된다.
 * 값이 아니라 열쇠 이름이므로 시크릿이 아니다.
 */
const SERVICE = 'com.onsquad.session';

/**
 * 두 토큰을 한 항목에 JSON 으로 넣는다.
 * Keychain 왕복이 한 번이면 되고, 둘은 항상 같이 갱신·삭제된다 —
 * 따로 저장하면 하나만 지워진 반쪽 상태가 생길 수 있다.
 */
const USERNAME = 'tokens';

/**
 * 토큰을 iOS Keychain / Android Keystore 에 넣는다.
 *
 * **이 파일이 `react-native-keychain` 을 import 하는 유일한 곳이다.**
 * 저장소를 바꾸더라도 이 파일 안만 바뀐다.
 *
 * `AsyncStorage` 는 평문이라 쓰지 않는다 — 루팅·탈옥 기기에서 그대로 읽힌다.
 */
export const saveTokens = async (tokens: StoredTokens): Promise<void> => {
  await Keychain.setGenericPassword(USERNAME, JSON.stringify(tokens), { service: SERVICE });
};

/**
 * 저장된 토큰을 읽는다. 없거나 깨져 있으면 `null`.
 *
 * 던지지 않는 이유는 브릿지의 `parseNativeMessage` 와 같다 —
 * 저장소 내용은 우리가 통제하지 못하는 입력이고, 실패해도 "로그인부터 다시" 라는 정상 경로가 있다.
 */
export const loadTokens = async (): Promise<StoredTokens | null> => {
  try {
    // 저장된 항목이 없으면 false 를 준다(null 이 아니다).
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });

    if (!credentials) {
      return null;
    }

    const parsed: unknown = JSON.parse(credentials.password);

    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    const tokens = parsed as Partial<StoredTokens>;

    if (typeof tokens.accessToken !== 'string' || typeof tokens.refreshToken !== 'string') {
      return null;
    }

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  } catch {
    return null;
  }
};

export const clearTokens = async (): Promise<void> => {
  await Keychain.resetGenericPassword({ service: SERVICE });
};
