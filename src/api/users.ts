import { api, type ApiResponse } from '@/lib/axios';

export interface MyProfile {
  userId: number;
}

export const userKeys = {
  me: ['users', 'me'] as const,
};

/** 내 정보. 채팅에서 내 메시지를 가려내는 데 userId를 쓴다 */
export async function fetchMe(): Promise<MyProfile> {
  const { data } = await api.get<ApiResponse<MyProfile>>('/v1/users/me');
  return data.data;
}
