import type { NaverMap, NaverMaps } from '@/lib/naverMaps';

export const DAEGU_DEFAULT_CAMERA = {
  center: { lat: 35.8515, lng: 128.6055 },
  zoom: 13,
};

/** 이동 중 대기 요청이 서로 덮이지 않도록 중심과 확대 수준을 한 번에 적용한다. */
export function showDefaultMap(maps: NaverMaps, instance: NaverMap) {
  const { center, zoom } = DAEGU_DEFAULT_CAMERA;
  instance.updateBy(new maps.LatLng(center.lat, center.lng), zoom);
}
