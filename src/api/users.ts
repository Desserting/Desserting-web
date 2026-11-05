import { api, type ApiResponse } from '@/lib/axios';

export interface MyProfile {
  userId: number;
  heartCount: number;
  isPremium: boolean;
}

export const userKeys = {
  me: ['users', 'me'] as const,
};

/** 내 정보. 채팅에서 내 메시지를 가려내는 userId, 보유 하트와 프리미엄 여부를 준다 */
export async function fetchMe(): Promise<MyProfile> {
  const { data } = await api.get<ApiResponse<MyProfile>>('/v1/users/me');
  return data.data;
}
