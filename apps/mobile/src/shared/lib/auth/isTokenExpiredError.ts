import { ErrorCode } from '../../api/model';

/** 토큰 만료(T003 코드 또는 HTTP 401) 응답으로 발생한 에러인지 판별한다. */
export const isTokenExpiredError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false;

  const e = error as { code?: unknown; status?: unknown };

  return e.code === ErrorCode.T003 || e.status === 401;
};
