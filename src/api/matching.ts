import { api, type ApiResponse } from '@/lib/axios';

export type MatchType = 'SAME_TASTE' | 'DIFFERENT_TASTE';

/** 랜덤 매칭으로 만난 후보 */
export interface RandomCandidate {
  userId: number;
  nickname: string;
  age: number;
  region: string;
  bio?: string | null;
  dessertAvatarUrl?: string | null;
  dessertTags: string[];
  commonDessertTags: string[];
  /** 정수 km 올림. 1은 1km 이내 */
  approxDistanceKm?: number | null;
}

export interface RandomMatchResult {
  found: boolean;
  candidate?: RandomCandidate | null;
  /** 후보가 없거나, 위치 대신 지역으로 찾은 경우의 안내 문구 */
  guide?: string | null;
  /** 오늘 본 상대를 다 봐서 처음부터 다시 보여주는 중이면 true */
  recycled?: boolean;
  appliedFilter?: string;
}

export interface RandomMatchParams {
  matchType: MatchType;
  /** 1~100. 내 좌표가 없으면 서버가 활동 지역 기준으로 대신한다 */
  radiusKm?: number;
  /** 지역명 앞부분 (`대구`, `대구 남구`) */
  region?: string;
}

/** 같은 API를 다시 부르면 다음 상대가 온다 (오늘 본 상대는 서버가 제외한다) */
export async function fetchRandomMatch(
  params: RandomMatchParams,
): Promise<RandomMatchResult> {
  const { data } = await api.get<ApiResponse<RandomMatchResult>>(
    '/v1/matches/random',
    { params },
  );
  return data.data;
}

/** 거리 필터를 쓰려면 매칭 전에 내 위치를 먼저 저장해야 한다 */
export async function updateMyLocation(body: {
  latitude: number;
  longitude: number;
  region?: string;
}): Promise<void> {
  await api.patch('/v1/users/me/location', body);
}

/** 좋아요는 토글이다 */
export async function toggleLike(userId: number): Promise<void> {
  await api.post(`/v1/users/${userId}/like`);
}
