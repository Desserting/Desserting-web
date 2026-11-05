import { api, type ApiResponse } from '@/lib/axios';
import { toList } from './list';

export interface MyProfile {
  userId: number;
  heartCount: number;
  isPremium: boolean;
}

/** 다른 사람의 프로필 (프로필 탐색·상세). 이메일·위치 같은 민감 정보는 오지 않는다 */
export interface OtherUserProfile {
  userId: number;
  nickname: string;
  gender?: 'MALE' | 'FEMALE';
  age: number;
  region: string;
  bio?: string | null;
  isPremium?: boolean;
  dessertAvatarUrl?: string | null;
  dessertTags: string[];
  /** 내가 이미 좋아요를 눌렀는지. 로그인하지 않았으면 null이다 */
  liked?: boolean | null;
}

export const userKeys = {
  me: ['users', 'me'] as const,
  profiles: ['users', 'profiles'] as const,
  profile: (userId: number) => ['users', 'profile', userId] as const,
  likesSent: ['users', 'me', 'likes', 'sent'] as const,
};

/** 내 정보. 채팅에서 내 메시지를 가려내는 userId, 보유 하트와 프리미엄 여부를 준다 */
export async function fetchMe(): Promise<MyProfile> {
  const { data } = await api.get<ApiResponse<MyProfile>>('/v1/users/me');
  return data.data;
}

/** 프로필 탐색 목록. 나 자신도 포함돼 있어서 화면에서 걸러야 한다 */
export async function fetchProfiles(): Promise<OtherUserProfile[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/v1/users');
  return toList<OtherUserProfile>(data.data, ['users', 'content', 'items']);
}

/** 프로필 상세. 없는 사용자면 U001(404)이다 */
export async function fetchProfile(userId: number): Promise<OtherUserProfile> {
  const { data } = await api.get<ApiResponse<OtherUserProfile>>(
    `/v1/users/${userId}`,
  );
  return data.data;
}

/** 내가 좋아요를 누른 사람 목록 */
export async function fetchLikedProfiles(): Promise<OtherUserProfile[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    '/v1/users/me/likes/sent',
  );
  return toList<OtherUserProfile>(data.data, ['users', 'content', 'items']);
}
