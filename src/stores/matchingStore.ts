import { create } from 'zustand';

export type MatchType = 'same' | 'different';

export interface MatchingFilter {
  type: MatchType;
  region: string;
  distance: string;
}

interface MatchingState {
  filter: MatchingFilter;
  setFilter: (filter: Partial<MatchingFilter>) => void;
}

export const REGIONS = [
  '서울',
  '경기 · 인천',
  '강원',
  '대전 · 충청',
  '광주 · 전라',
  '대구 · 경북',
  '부산 · 울산 · 경남',
  '제주',
];

export const DISTANCES = ['3km', '5km', '10km', '20km', '50km'];

export const useMatchingStore = create<MatchingState>((set) => ({
  filter: { type: 'same', region: '대구 · 경북', distance: '10km' },
  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),
}));
