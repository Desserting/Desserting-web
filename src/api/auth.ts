import { api, type ApiResponse } from '@/lib/axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  /** 2~20자 */
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  /** 19~99 */
  age: number;
  /** 활동 지역 (예: 대구 남구) */
  region: string;
  /** 선호 디저트 코드(DessertType). 1개 이상 */
  dessertTypes: string[];
  agreeToTerms: boolean;
}

export async function login(body: LoginRequest): Promise<AuthTokens> {
  const { data } = await api.post<ApiResponse<AuthTokens>>(
    '/v1/auth/login',
    body,
  );
  return data.data;
}

/** 가입하면 로그인된 상태의 토큰이 바로 내려온다 */
export async function signup(body: SignupRequest): Promise<AuthTokens> {
  const { data } = await api.post<ApiResponse<AuthTokens>>(
    '/v1/auth/signup',
    body,
  );
  return data.data;
}
