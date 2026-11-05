import { api, type ApiResponse } from '@/lib/axios';
import { toList } from './list';

/** 제휴 매장 카드 */
export interface StoreCard {
  storeId: number;
  name: string;
  address?: string;
  coverImageUrl?: string | null;
  dessertTypes?: string[];
  representativeMenuName?: string | null;
  themeStreetName?: string | null;
  /** 기준 위치가 없으면 null */
  distanceKm?: number | null;
}

export const storeKeys = {
  list: ['stores', 'list'] as const,
};

/** 제휴 매장 전체. 파라미터를 주지 않으면 이름순으로 온다 */
export async function fetchStores(): Promise<StoreCard[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/v1/stores');
  return toList<StoreCard>(data.data, ['stores', 'content', 'items']);
}
