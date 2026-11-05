import { api, type ApiResponse } from '@/lib/axios';
import { toList } from './list';

/** 제휴 매장 카드 */
export interface StoreCard {
  storeId: number;
  name: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  /** 소속 테마거리가 없으면 null */
  themeStreetId?: number | null;
  themeStreetName?: string | null;
  coverImageUrl?: string | null;
  dessertTypes?: string[];
  representativeMenuName?: string | null;
  /** 제휴 할인 안내 문구 */
  partnerDiscountNotice?: string | null;
  /** 기준 위치가 없으면 null */
  distanceKm?: number | null;
}

export type MenuCategory = 'DESSERT' | 'DRINK' | 'SET';

export interface StoreMenu {
  menuId: number;
  name: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  /** 대표 메뉴 여부. 서버가 대표 메뉴를 앞에 정렬해서 보낸다 */
  representative?: boolean;
  soldOut?: boolean;
  category?: MenuCategory;
  categoryLabel?: string;
}

/** 제휴 매장 상세 */
export interface StoreDetail {
  storeId: number;
  name: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  businessHours?: string | null;
  contact?: string | null;
  coverImageUrl?: string | null;
  partnerDiscountNotice?: string | null;
  themeStreetId?: number | null;
  themeStreetName?: string | null;
  dessertTypes?: string[];
  menus?: StoreMenu[];
}

/** 테마거리 (앞산 카페거리 같은 구역) */
export interface ThemeStreet {
  id: number;
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  isActive?: boolean;
}

/** 모든 조건은 선택이고 함께 적용된다 */
export interface StoreSearchParams {
  themeStreetId?: number;
  /** DESSERT_LABELS의 코드 (CAKE, BAKERY …) */
  dessertType?: string;
}

export const storeKeys = {
  list: ['stores', 'list'] as const,
  search: (params: StoreSearchParams) =>
    [
      'stores',
      'list',
      params.themeStreetId ?? null,
      params.dessertType ?? null,
    ] as const,
  detail: (storeId: number) => ['stores', 'detail', storeId] as const,
  themes: ['stores', 'themes'] as const,
};

/**
 * 제휴 매장 검색. 파라미터를 주지 않으면 전체가 이름순으로 온다.
 * 기준 위치(lat/lng)를 따로 주지 않아 내 저장 위치로 거리가 계산된다.
 */
export async function fetchStores(
  params: StoreSearchParams = {},
): Promise<StoreCard[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/v1/stores', {
    params,
  });
  return toList<StoreCard>(data.data, ['stores', 'content', 'items']);
}

/** 제휴 매장 상세. 없는 매장이면 404다 */
export async function fetchStoreDetail(storeId: number): Promise<StoreDetail> {
  const { data } = await api.get<ApiResponse<StoreDetail>>(
    `/v1/stores/${storeId}`,
  );
  return data.data;
}

/** 테마거리 목록 */
export async function fetchThemeStreets(): Promise<ThemeStreet[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/v1/themes');
  return toList<ThemeStreet>(data.data, ['themes', 'content', 'items']);
}
