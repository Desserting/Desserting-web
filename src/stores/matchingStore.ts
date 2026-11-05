import { create } from 'zustand';
import type { RandomMatchResult } from '@/api/matching';

export type MatchType = 'same' | 'different';

export const REGIONS = ['대구', '경북'] as const;

export type Region = (typeof REGIONS)[number];

export interface LivingArea {
  id: string;
  label: string;
  districts?: string;
}

export const LIVING_AREAS: Record<Region, LivingArea[]> = {
  대구: [
    { id: 'daegu-central', label: '대구 중부', districts: '중구·남구' },
    { id: 'daegu-east', label: '대구 동부', districts: '동구·수성구' },
    { id: 'daegu-northwest', label: '대구 서북부', districts: '북구·서구' },
    {
      id: 'daegu-southwest',
      label: '대구 서남부',
      districts: '달서구·달성군',
    },
    { id: 'daegu-gunwi', label: '대구 군위', districts: '군위군' },
  ],
  경북: [
    { id: 'gb-daegu-adjacent', label: '대구 인접권' },
    { id: 'gb-west', label: '경북 서부권' },
    { id: 'gb-east-coast', label: '경북 동해안권' },
    { id: 'gb-north', label: '경북 북부권' },
    { id: 'gb-northwest', label: '경북 북서권' },
  ],
};

export const DISTANCES = [
  { value: '10km', label: '10km', summary: '10km 이내' },
  { value: '30km', label: '30km', summary: '30km 이내' },
  { value: '50km', label: '50km', summary: '50km 이내' },
  { value: 'unlimited', label: '무제한', summary: '생활권 내 무제한' },
];

export interface MatchingFilter {
  type: MatchType;
  region: Region;
  area: string;
  distance: string;
}

interface MatchingState {
  filter: MatchingFilter;
  setFilter: (filter: Partial<MatchingFilter>) => void;

  // 카드 화면과 프로필 화면을 오가도 진행 상황이 유지되도록 스토어에 둔다
  /** 지금 보여주는 랜덤 매칭 결과. 서버는 호출할 때마다 다음 상대를 준다 */
  current: RandomMatchResult | null;
  /** 이번 매칭에서 지금까지 본 상대 수 */
  shownCount: number;
  /** 위치 사용 안내를 이미 보여줬는지. 한 번 답했으면 매칭마다 다시 묻지 않는다 */
  locationPrompted: boolean;
  setLocationPrompted: () => void;
  dealt: boolean;
  likedIds: string[];
  requestedIds: string[];
  /** 매칭을 새로 시작한다. 첫 결과를 같이 넣는다 */
  startMatching: (first: RandomMatchResult) => void;
  showNextMatch: (next: RandomMatchResult) => void;
  markDealt: () => void;
  toggleLike: (key: string) => void;
  /** 서버가 알려준 좋아요 여부를 반영한다 (프로필 목록·상세를 불러올 때) */
  syncLiked: (profiles: { userId: number; liked?: boolean | null }[]) => void;
  requestChat: (key: string) => void;
}

/** 좋아요·요청 상태를 기억하는 키 */
export const serverCandidateKey = (userId: number) => `user-${userId}`;

const withKey = (keys: string[], key: string, on: boolean) =>
  on
    ? keys.includes(key)
      ? keys
      : [...keys, key]
    : keys.filter((existing) => existing !== key);

/** 서버가 알려준 좋아요·요청 여부를 화면 상태에 맞춘다. 새로고침 뒤에도 서버 값이 기준이다 */
function syncServerFlags(state: MatchingState, result: RandomMatchResult) {
  const candidate = result.found ? result.candidate : null;
  if (!candidate) return {};
  const key = serverCandidateKey(candidate.userId);
  return {
    likedIds:
      candidate.liked === undefined
        ? state.likedIds
        : withKey(state.likedIds, key, candidate.liked),
    requestedIds:
      candidate.requested === undefined
        ? state.requestedIds
        : withKey(state.requestedIds, key, candidate.requested),
  };
}

export const useMatchingStore = create<MatchingState>((set) => ({
  filter: {
    type: 'same',
    region: '대구',
    area: LIVING_AREAS.대구[0].id,
    distance: '30km',
  },
  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  current: null,
  shownCount: 0,
  locationPrompted: false,
  setLocationPrompted: () => set({ locationPrompted: true }),
  dealt: false,
  likedIds: [],
  requestedIds: [],
  startMatching: (first) =>
    set((state) => ({
      ...syncServerFlags(state, first),
      current: first,
      shownCount: first.found ? 1 : 0,
      dealt: false,
    })),
  showNextMatch: (next) =>
    set((state) => ({
      ...syncServerFlags(state, next),
      current: next,
      shownCount: next.found ? state.shownCount + 1 : state.shownCount,
    })),
  markDealt: () => set({ dealt: true }),
  toggleLike: (id) =>
    set((state) => ({
      likedIds: state.likedIds.includes(id)
        ? state.likedIds.filter((likedId) => likedId !== id)
        : [...state.likedIds, id],
    })),
  syncLiked: (profiles) =>
    set((state) => {
      let likedIds = state.likedIds;
      for (const { userId, liked } of profiles) {
        if (typeof liked !== 'boolean') continue;
        likedIds = withKey(likedIds, serverCandidateKey(userId), liked);
      }
      return likedIds === state.likedIds ? state : { likedIds };
    }),
  requestChat: (id) =>
    set((state) =>
      state.requestedIds.includes(id)
        ? state
        : { requestedIds: [...state.requestedIds, id] },
    ),
}));
