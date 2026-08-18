import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { queryClient, setSessionLostHandler } from '../query/queryClient';
import { installSessionRefresh, login as loginRequest, logout as logoutRequest, restoreSession } from './authService';

interface AuthContextValue {
  isAuthenticated: boolean;
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

  useEffect(() => {
    // 갱신까지 실패하면 상태를 내리고 캐시를 비운다. 이전 사용자의 데이터가 남으면 안 된다.
    const handleSessionLost = () => {
      setIsAuthenticated(false);
      queryClient.clear();
    };

    setSessionLostHandler(handleSessionLost);
    installSessionRefresh(handleSessionLost);

    restoreSession()
      .then(setIsAuthenticated)
      .finally(() => setIsRestoring(false));
  }, []);

  const login = useCallback(async (params: { email: string; password: string }) => {
    await loginRequest(params);

    setIsAuthenticated(true);
    // 로그인 전에 받아둔 응답은 전부 **익명 시점의 것**이다.
    // 같은 엔드포인트라도 인증되면 `states` 가 달라진다(예: crews/{id} 의 alreadyParticipant).
    // 비우지 않으면 로그인해도 "속해있지 않아요" 가 뜬다 — 실제로 밟았다.
    queryClient.clear();
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();

    setIsAuthenticated(false);
    queryClient.clear();
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, isRestoring, login, logout }),
    [isAuthenticated, isRestoring, login, logout],
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
