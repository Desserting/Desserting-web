import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL;
const defaultHeaders = { 'ngrok-skip-browser-warning': 'true' };

/** 백엔드 공통 응답 형식 (성공) */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/** 백엔드 공통 응답 형식 (실패) — 화면 분기는 HTTP 상태가 아닌 code로 한다 */
export interface ApiErrorBody {
  success: false;
  code: string;
  message: string;
  errors?: { field: string; value: string; reason: string }[];
}

export const api = axios.create({ baseURL, headers: defaultHeaders });

export function getApiError(error: unknown): ApiErrorBody | null {
  if (axios.isAxiosError<ApiErrorBody>(error) && error.response?.data?.code) {
    return error.response.data;
  }
  return null;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null;

/** 토큰을 재발급한다. 동시에 여러 번 불려도 요청은 한 번만 나간다. */
export function refreshAccessToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return Promise.reject(new Error('no refresh token'));

  refreshing ??= axios
    .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      `${baseURL}/v1/auth/refresh`,
      { refreshToken },
      { headers: defaultHeaders },
    )
    .then(({ data }) => {
      useAuthStore
        .getState()
        .setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.accessToken;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// 만료된 토큰도 A001(401)로 오므로, 401이면 한 번만 재발급 후 원래 요청을 재시도한다
api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || !error.config) throw error;

  const original = error.config as RetriableConfig;
  const isAuthApi = original.url?.includes('/auth/');
  if (error.response?.status !== 401 || original._retried || isAuthApi) {
    throw error;
  }

  original._retried = true;
  try {
    const accessToken = await refreshAccessToken();
    original.headers.Authorization = `Bearer ${accessToken}`;
    return api(original);
  } catch {
    useAuthStore.getState().logout();
    window.location.replace('/signup');
    throw error;
  }
});
