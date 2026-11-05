import { api, type ApiResponse } from '@/lib/axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function login(body: LoginRequest): Promise<AuthTokens> {
  const { data } = await api.post<ApiResponse<AuthTokens>>(
    '/v1/auth/login',
    body,
  );
  return data.data;
}
