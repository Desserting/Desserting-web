import { api, type ApiResponse } from '@/lib/axios';

export interface MyProfile {
  userId: number;
  nickname: string;
  dessertAvatarUrl: string | null;
  heartCount: number;
  isPremium: boolean;
}

export const userKeys = {
  me: ['users', 'me'] as const,
};

/** 내 프로필과 계정 상태. 채팅에서는 userId로 내 메시지를 구분한다. */
export async function fetchMe(): Promise<MyProfile> {
  const { data } = await api.get<ApiResponse<MyProfile>>('/v1/users/me');
  return data.data;
}
