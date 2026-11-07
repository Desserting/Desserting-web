import axios from 'axios';
import { api, getApiError, type ApiResponse } from '@/lib/axios';

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

/** 서버에 로그아웃을 알려 리프레시 토큰을 무효화한다. 로컬 토큰 정리는 호출하는 쪽에서 한다 */
export async function logout(refreshToken: string): Promise<void> {
  await api.post('/v1/auth/logout', { refreshToken });
}

/**
 * 가입 실패가 이메일 때문이면 첫 화면에 보여줄 안내를 돌려준다.
 * 명세에 중복 이메일 전용 코드가 없어, 이메일 필드를 가리키는 오류나 409 응답으로 판단한다
 */
export function getSignupEmailError(error: unknown): string | null {
  const apiError = getApiError(error);
  const fieldError = apiError?.errors?.find((item) => item.field === 'email');
  if (fieldError) return fieldError.reason;
  const isConflict =
    axios.isAxiosError(error) &&
    error.response?.status === 409 &&
    !/닉네임/.test(apiError?.message ?? '');
  if (isConflict || /이메일/.test(apiError?.message ?? '')) {
    return '이미 가입된 이메일이에요. 다른 이메일을 입력해 주세요.';
  }
  return null;
}

/** 가입하면 로그인된 상태의 토큰이 바로 내려온다 */
export async function signup(body: SignupRequest): Promise<AuthTokens> {
  const { data } = await api.post<ApiResponse<AuthTokens>>(
    '/v1/auth/signup',
    body,
  );
  return data.data;
}
