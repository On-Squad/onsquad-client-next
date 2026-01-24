import { AxiosRequestConfig } from 'axios';

import { apiFetch } from '../common';
import type { ResponseModel } from '../model';

export interface UserLoginPostFetchParams {
  email: string;
  password: string;
}

export interface UserLoginResponse extends ResponseModel {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const userLoginPostFetch = (params: UserLoginPostFetchParams) =>
  apiFetch.post<UserLoginResponse>('/auth/login', params);
