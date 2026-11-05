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
  gender?: 'MALE' | 'FEMALE';
  /** 내가 이미 대화 요청을 보낸 상대면 true. 새로고침해도 요청 상태를 유지하는 데 쓴다 */
  requested?: boolean;
  /** 내가 이미 좋아요를 누른 상대면 true */
  liked?: boolean;
  /**
   * 대화 요청을 보낼 수 있는지. false면 차단, 하트 부족, 일반 회원의 24시간 외 미노출 중 하나다
   * (이유는 응답에 없다).
   */
  canRequest?: boolean;
}

/** 서버가 실제로 적용한 조건. 서버에 새 값이 생길 수 있어 문자열도 허용한다 */
export type AppliedFilter =
  'DISTANCE' | 'REGION' | 'DISTANCE_AND_REGION' | (string & {});

export interface RandomMatchResult {
  found: boolean;
  candidate?: RandomCandidate | null;
  /** 후보가 없거나, 위치 대신 지역으로 찾은 경우의 안내 문구 */
  guide?: string | null;
  /** 오늘 본 상대를 다 봐서 처음부터 다시 보여주는 중이면 true */
  recycled?: boolean;
  appliedFilter?: AppliedFilter;
}

export interface RandomMatchParams {
  matchType: MatchType;
  /** 1~100. 내 좌표가 없으면 거리 조건은 빠지고 지역 조건만 적용된다 */
  radiusKm?: number;
  /** 지역명 앞부분 (`대구`, `대구 남구`). 쉼표로 여러 개 보내면 그중 하나에 속하는 상대를 찾는다 */
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
