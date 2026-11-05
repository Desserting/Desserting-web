export const CAFE_AREAS = [
  { id: 'apsan', name: '앞산 카페거리' },
  { id: 'suseong', name: '수성못 거리' },
  { id: 'dongseongro', name: '동성로 거리' },
] as const;

export const CAFE_FILTERS = [
  { id: 'all', label: '전체', image: null },
  { id: 'CAKE', label: '케이크', image: '/avatars/cake.png' },
  { id: 'BAKERY', label: '베이커리', image: '/avatars/bakery.png' },
  { id: 'COOKIE_FINANCIER', label: '구움과자', image: '/avatars/cookie.png' },
  { id: 'TART_PIE', label: '타르트&파이', image: '/avatars/tart.png' },
  {
    id: 'ICE_CREAM_BINGSU',
    label: '빙수&아이스크림',
    image: '/avatars/bingsu.png',
  },
  { id: 'COFFEE', label: '커피', image: '/avatars/coffee.png' },
  { id: 'TEA_NON_COFFEE', label: '차&논커피', image: '/avatars/tea.png' },
  {
    id: 'TRADITIONAL_KOREAN',
    label: '전통 디저트',
    image: '/avatars/traditional.png',
  },
] as const;

export type CafeAreaId = (typeof CAFE_AREAS)[number]['id'];
export type CafeFilter = Exclude<(typeof CAFE_FILTERS)[number]['id'], 'all'>;

export function findCafeArea(id: string | undefined) {
  return CAFE_AREAS.find((area) => area.id === id);
}
