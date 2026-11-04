export const CAFE_AREAS = [
  { id: 'apsan', name: '앞산 카페거리' },
  { id: 'suseong', name: '수성못 거리' },
  { id: 'dongseongro', name: '동성로 거리' },
] as const;

export const CAFE_FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'dessert', label: '디저트' },
  { id: 'cafe', label: '카페' },
  { id: 'drink', label: '음료' },
] as const;

export type CafeAreaId = (typeof CAFE_AREAS)[number]['id'];
export type CafeFilter = Exclude<(typeof CAFE_FILTERS)[number]['id'], 'all'>;

export function findCafeArea(id: string | undefined) {
  return CAFE_AREAS.find((area) => area.id === id);
}
