import { create } from 'zustand';

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

  // 카드 목록과 프로필 화면을 오가도 진행 상황이 유지되도록 스토어에 둔다
  cardIndex: number;
  dealt: boolean;
  likedIds: number[];
  requestedIds: number[];
  startMatching: () => void;
  showNextCard: () => void;
  markDealt: () => void;
  toggleLike: (id: number) => void;
  requestChat: (id: number) => void;
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

  cardIndex: 0,
  dealt: false,
  likedIds: [],
  requestedIds: [],
  startMatching: () => set({ cardIndex: 0, dealt: false }),
  showNextCard: () => set((state) => ({ cardIndex: state.cardIndex + 1 })),
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
