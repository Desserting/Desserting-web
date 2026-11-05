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
  requestChat: (key: string) => void;
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
    set({ current: first, shownCount: first.found ? 1 : 0, dealt: false }),
  showNextMatch: (next) =>
    set((state) => ({
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
  requestChat: (id) =>
    set((state) =>
      state.requestedIds.includes(id)
        ? state
        : { requestedIds: [...state.requestedIds, id] },
    ),
}));
