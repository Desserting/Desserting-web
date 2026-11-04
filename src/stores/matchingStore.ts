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
  { value: '10km', label: '10km 이내', summary: '10km 이내' },
  { value: '30km', label: '30km 이내', summary: '30km 이내' },
  { value: '50km', label: '50km 이내', summary: '50km 이내' },
  {
    value: 'unlimited',
    label: '거리 제한 없음 (선택한 생활권)',
    summary: '거리 제한 없음',
  },
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
}));
