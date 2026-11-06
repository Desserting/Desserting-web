import { queryOptions } from '@tanstack/react-query';

/** 이 화면에서 사용하는 NAVER Maps JavaScript SDK 인터페이스. */
export interface NaverLatLng {
  lat(): number;
  lng(): number;
}
export interface NaverPoint {
  x: number;
  y: number;
}
export interface NaverSize {
  width: number;
  height: number;
}
export interface NaverMap {
  updateBy(position: NaverLatLng, zoom: number): void;
  fitBounds(
    points: NaverLatLng[],
    options: {
      top: number;
      right: number;
      bottom: number;
      left: number;
      maxZoom: number;
    },
  ): void;
  setZoom(zoom: number): void;
  getZoom(): number;
  setSize(size: NaverSize): void;
  destroy(): void;
}
export interface NaverLayer {
  setMap(map: NaverMap | null): void;
  setVisible(visible: boolean): void;
}
export interface NaverEventListener {
  eventName?: string;
  target?: unknown;
}
export interface NaverMaps {
  Map: new (
    element: HTMLElement,
    options: {
      center: NaverLatLng;
      zoom: number;
      minZoom: number;
      maxZoom: number;
      keyboardShortcuts: boolean;
    },
  ) => NaverMap;
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  Point: new (x: number, y: number) => NaverPoint;
  Size: new (width: number, height: number) => NaverSize;
  Polygon: new (options: {
    map: NaverMap;
    paths: NaverLatLng[][];
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeStyle: string;
    fillColor: string;
    fillOpacity: number;
    clickable: boolean;
  }) => NaverLayer;
  Marker: new (options: {
    map: NaverMap;
    position: NaverLatLng;
    icon: { content: HTMLElement; anchor: NaverPoint };
    zIndex: number;
  }) => NaverLayer;
  Event: {
    addListener(
      target: NaverLayer | NaverMap,
      type: string,
      handler: () => void,
    ): NaverEventListener;
    removeListener(listener: NaverEventListener): void;
  };
}

declare global {
  interface Window {
    naver?: { maps: NaverMaps };
    __dessertingNaverMapsReady?: () => void;
    navermap_authFailure?: () => void;
  }
}

let loading: Promise<NaverMaps> | undefined;
export const NAVER_MAP_AUTH_ERROR = 'desserting:naver-map-auth-error';

/** 한 번만 SDK를 불러오며, 실패했을 때는 다시 시도할 수 있다. */
export function loadNaverMaps(): Promise<NaverMaps> {
  if (loading) return loading;
  if (window.naver?.maps?.Map) return Promise.resolve(window.naver.maps);
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID?.trim();
  if (!clientId)
    return Promise.reject(new Error('지도 서비스를 준비 중이에요.'));

  loading = new Promise<NaverMaps>((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(fail, 20000);
    function fail() {
      window.clearTimeout(timeout);
      delete window.__dessertingNaverMapsReady;
      script.remove();
      reject(
        new Error('지도를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'),
      );
    }
    window.__dessertingNaverMapsReady = () => {
      if (!window.naver?.maps?.Map) return fail();
      window.clearTimeout(timeout);
      delete window.__dessertingNaverMapsReady;
      resolve(window.naver.maps);
    };
    script.async = true;
    script.onerror = fail;
    window.navermap_authFailure = () => {
      loading = undefined;
      window.dispatchEvent(new Event(NAVER_MAP_AUTH_ERROR));
      fail();
    };
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}&callback=__dessertingNaverMapsReady`;
    document.head.append(script);
  }).catch((error: unknown) => {
    loading = undefined;
    throw error;
  });
  return loading;
}

export const naverMapsQueryOptions = queryOptions({
  queryKey: ['naver-map-sdk'],
  queryFn: loadNaverMaps,
  retry: false,
  staleTime: Infinity,
});
