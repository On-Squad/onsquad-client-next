import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { userInfoGetFetch } from '../entities/auth/api/userInfoGetFetch';
import { queryClient, setSessionLostHandler } from '../query/queryClient';
import { installSessionRefresh, login as loginRequest, logout as logoutRequest, restoreSession } from './authService';

/**
 * 로그인한 사람의 신원.
 *
 * **앱이 원본을 갖는다.** 화면은 이것으로 "이 크루가 내 것인가" 같은 판정을 한다.
 * 응답 전체를 담지 않고 화면이 실제로 쓰는 것만 둔다 — 넓히면 되돌리기 어렵다.
 */
export interface Me {
  id: number;
  nickname: string;
  email: string;
  profileImage: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  /** 로그인 전이거나 조회에 실패하면 null. */
  me: Me | null;
  /** 저장소에서 세션을 복구하는 중. 첫 프레임에 잘못된 화면을 띄우지 않으려고 쓴다. */
  isRestoring: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 화면이 인증을 보는 유일한 통로.
 *
 * 화면은 Keychain 도 `/auth/login` 도 모른다 —
 * `session.ts` 가 약속한 "이 파일 안만 바뀌고 화면 코드는 그대로다" 를 지키는 구조다.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [me, setMe] = useState<Me | null>(null);

  /**
   * 내 정보를 세션에 싣는다. 로그인 직후와 앱 시작 시 복구 직후에 한 번씩 부른다.
   *
   * 실패해도 던지지 않는다 — 내 정보를 못 가져와도 앱은 계속 써야 하고,
   * 못 가져왔을 때 잃는 것은 크루장 뱃지 하나뿐이다.
   */
  const loadMe = useCallback(async () => {
    try {
      const res = await userInfoGetFetch();
      const { id, nickname, email, profileImage } = res.data.data;

      setMe({ id, nickname, email, profileImage });
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    // 갱신까지 실패하면 상태를 내리고 캐시를 비운다. 이전 사용자의 데이터가 남으면 안 된다.
    const handleSessionLost = () => {
      setIsAuthenticated(false);
      setMe(null);
      queryClient.clear();
    };

    setSessionLostHandler(handleSessionLost);
    installSessionRefresh(handleSessionLost);

    restoreSession()
      .then(async restored => {
        setIsAuthenticated(restored);

        if (restored) {
          await loadMe();
        }
      })
      .finally(() => setIsRestoring(false));
  }, [loadMe]);

  const login = useCallback(async (params: { email: string; password: string }) => {
    await loginRequest(params);

    setIsAuthenticated(true);
    // 로그인 전에 받아둔 응답은 전부 **익명 시점의 것**이다.
    // 같은 엔드포인트라도 인증되면 `states` 가 달라진다(예: crews/{id} 의 alreadyParticipant).
    // 비우지 않으면 로그인해도 "속해있지 않아요" 가 뜬다 — 실제로 밟았다.
    queryClient.clear();

    await loadMe();
  }, [loadMe]);

  const logout = useCallback(async () => {
    await logoutRequest();

    setIsAuthenticated(false);
    setMe(null);
    queryClient.clear();
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isRestoring, me, login, logout }),
    [isAuthenticated, isRestoring, me, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있습니다.');
  }

  return context;
}
