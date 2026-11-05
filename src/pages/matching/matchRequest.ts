import { updateMyLocation, type RandomMatchParams } from '@/api/matching';
import { LIVING_AREAS, type MatchingFilter } from '@/stores/matchingStore';

/**
 * 생활권을 서버 region으로 바꾼다. 서버는 쉼표로 여러 지역을 받아 그중 하나에 속하면 찾는다.
 * 대구 생활권은 구·군으로 풀어 보내고(`대구 중구,대구 남구`),
 * 구·군 정보가 없는 경북 생활권은 시·도(`경북`)만 보낸다.
 */
export function toRegionParam(filter: MatchingFilter): string {
  const districts = LIVING_AREAS[filter.region]
    .find((area) => area.id === filter.area)
    ?.districts?.split('·');
  if (!districts) return filter.region;
  return districts.map((district) => `${filter.region} ${district}`).join(',');
}

/** 매칭 설정을 랜덤 매칭 API 파라미터로 바꾼다. */
export function toMatchParams(filter: MatchingFilter): RandomMatchParams {
  return {
    matchType: filter.type === 'same' ? 'SAME_TASTE' : 'DIFFERENT_TASTE',
    region: toRegionParam(filter),
    // 무제한이면 반경을 보내지 않는다
    radiusKm:
      filter.distance === 'unlimited'
        ? undefined
        : Number.parseInt(filter.distance, 10),
  };
}

export type LocationPermission =
  'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * 위치 권한 상태. 아직 묻지 않았으면 'prompt'라서 브라우저 권한 창 전에 우리 안내를 먼저 보여줄 수 있다.
 * 권한 상태를 알 수 없는 브라우저(일부 Safari)는 'prompt'로 본다.
 */
export async function getLocationPermission(): Promise<LocationPermission> {
  if (!('geolocation' in navigator)) return 'unsupported';
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state;
  } catch {
    return 'prompt';
  }
}

function getCurrentPosition(): Promise<GeolocationPosition | null> {
  if (!('geolocation' in navigator)) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
      timeout: 5000,
      maximumAge: 60_000,
    });
  });
}

/**
 * 거리 필터를 쓰려면 매칭 전에 내 위치를 서버에 저장해야 한다.
 * 위치 권한을 거부했거나 저장에 실패해도 매칭은 계속한다(서버가 활동 지역 기준으로 대신한다).
 */
export async function saveMyLocation(): Promise<void> {
  const position = await getCurrentPosition();
  if (!position) return;
  try {
    await updateMyLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  } catch {
    // 위치 저장 실패는 매칭을 막지 않는다
  }
}
