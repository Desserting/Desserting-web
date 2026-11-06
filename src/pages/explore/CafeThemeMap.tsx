import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import {
  isMapCoordinate,
  type CafeStore,
  type MapCoordinate,
  type ThemeStreet,
} from '@/api/cafeBooking';
import {
  naverMapsQueryOptions,
  NAVER_MAP_AUTH_ERROR,
  type NaverEventListener,
  type NaverLayer,
  type NaverMap,
} from '@/lib/naverMaps';
import { Button } from '@/components/ui/button';
import storePin from '@/assets/explore/map/store-pin.svg';
import recenter from '@/assets/explore/map/recenter.svg';
import {
  cafeMapName,
  mapLabelsOverlap,
  type MapLabelRect,
} from './cafeMapLabels';
import { DAEGU_DEFAULT_CAMERA, showDefaultMap } from './cafeMapCamera';

const storeCoordinate = (store: CafeStore) => {
  const point = { lat: store.latitude, lng: store.longitude };
  return isMapCoordinate(point) ? point : null;
};

export default function CafeThemeMap({
  entryKey,
  areas,
  selected,
  focusSelected = false,
  stores,
  onSelect,
  from,
}: {
  entryKey: string;
  areas: ThemeStreet[];
  selected?: ThemeStreet;
  focusSelected?: boolean;
  stores: CafeStore[];
  onSelect: (id: number) => void;
  from: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<NaverMap | null>(null);
  const [readyMap, setReadyMap] = useState<NaverMap | null>(null);
  const clearLayers = useRef<(() => void) | null>(null);
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();
  const sdk = useQuery(naverMapsQueryOptions);

  useEffect(() => {
    const handleAuthError = () => setAuthError(true);
    window.addEventListener(NAVER_MAP_AUTH_ERROR, handleAuthError);
    return () =>
      window.removeEventListener(NAVER_MAP_AUTH_ERROR, handleAuthError);
  }, []);

  useEffect(() => {
    const element = container.current;
    const maps = sdk.data;
    if (!element || !maps) return;
    // 지도 크기는 패널 위쪽에 남는 캔버스 영역(container) 기준으로 맞춘다.
    const frame = element;
    const instance = new maps.Map(element, {
      center: new maps.LatLng(
        DAEGU_DEFAULT_CAMERA.center.lat,
        DAEGU_DEFAULT_CAMERA.center.lng,
      ),
      zoom: DAEGU_DEFAULT_CAMERA.zoom,
      minZoom: 7,
      maxZoom: 20,
      keyboardShortcuts: true,
    });
    map.current = instance;
    let initialized = false;
    const resize = () => {
      const { width, height } = frame.getBoundingClientRect();
      if (width > 0 && height > 0)
        instance.setSize(new maps.Size(width, height));
    };
    // SDK의 메타데이터와 좌표 투영 초기화가 끝난 뒤 오버레이를 만든다.
    const initListener = maps.Event.addListener(instance, 'init', () => {
      initialized = true;
      resize();
      setReadyMap(instance);
    });
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (initialized && width > 0 && height > 0)
        instance.setSize(new maps.Size(width, height));
    });
    observer.observe(frame);
    return () => {
      observer.disconnect();
      maps.Event.removeListener(initListener);
      clearLayers.current?.();
      map.current = null;
      instance.destroy();
    };
  }, [sdk.data]);

  useEffect(() => {
    const maps = sdk.data;
    const instance = readyMap;
    if (!maps || !instance || map.current !== instance) return;
    const layers: NaverLayer[] = [];
    const listeners: NaverEventListener[] = [];
    const streetLabels: { element: HTMLButtonElement; marker: NaverLayer }[] =
      [];
    const storeLabels: { label: HTMLSpanElement; pin: HTMLImageElement }[] = [];
    const theme = getComputedStyle(container.current!);
    const mintDeep =
      theme.getPropertyValue('--color-mint-deep').trim() || '#258f77';
    const mint = theme.getPropertyValue('--color-mint').trim() || '#8ce2d0';
    for (const area of areas) {
      const active = area.id === selected?.id;
      if (area.boundary.length >= 3) {
        const polygon = new maps.Polygon({
          map: instance,
          paths: [
            area.boundary.map(({ lat, lng }) => new maps.LatLng(lat, lng)),
          ],
          strokeWeight: active ? 3 : 2,
          strokeColor: mintDeep,
          strokeOpacity: active ? 0.95 : 0.55,
          strokeStyle: 'solid',
          fillColor: mint,
          fillOpacity: active ? 0.28 : 0.1,
          clickable: true,
        });
        listeners.push(
          maps.Event.addListener(polygon, 'click', () => onSelect(area.id)),
        );
        layers.push(polygon);
      }
      if (area.center) {
        const label = document.createElement('button');
        label.type = 'button';
        label.setAttribute('aria-pressed', String(active));
        label.className = `relative inline-flex h-11 max-w-60 cursor-pointer items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm font-bold whitespace-nowrap shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint-deep ${active ? 'border-mint-deep bg-mint-deep text-white' : 'border-mint-deep/30 bg-white text-mint-deep'}`;
        const iconCircle = document.createElement('span');
        iconCircle.className = `grid size-8 shrink-0 place-items-center rounded-full ${active ? 'bg-white' : 'bg-mint-100'}`;
        const icon = document.createElement('img');
        icon.src = storePin;
        icon.alt = '';
        icon.width = 20;
        icon.height = 26;
        iconCircle.append(icon);
        const text = document.createElement('span');
        text.textContent = area.name;
        text.className = 'min-w-0 truncate';
        const tail = document.createElement('span');
        tail.setAttribute('aria-hidden', 'true');
        tail.className = `absolute -bottom-1.5 left-4 size-3 rotate-45 rounded-[2px] border-r border-b ${active ? 'border-mint-deep bg-mint-deep' : 'border-mint-deep/30 bg-white'}`;
        label.append(tail, iconCircle, text);
        label.onclick = () => onSelect(area.id);
        const streetMarker = new maps.Marker({
          map: instance,
          position: new maps.LatLng(area.center.lat, area.center.lng),
          icon: { content: label, anchor: new maps.Point(22, 50) },
          zIndex: active ? 6 : 5,
        });
        streetLabels.push({ element: label, marker: streetMarker });
        layers.push(streetMarker);
      }
    }
    for (const store of stores) {
      const point = storeCoordinate(store);
      if (!point) continue;
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.setAttribute(
        'aria-label',
        `${cafeMapName(store.name)} 매장 상세보기`,
      );
      marker.className =
        'relative flex h-11 w-[34px] cursor-pointer items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-mint-deep';
      marker.title = cafeMapName(store.name);
      const image = document.createElement('img');
      image.src = storePin;
      image.alt = '';
      image.width = 34;
      image.height = 44;
      const name = document.createElement('span');
      name.textContent = cafeMapName(store.name);
      name.className =
        'absolute top-11 left-1/2 max-w-36 -translate-x-1/2 truncate rounded-full border border-mint-100 bg-white px-2 py-1 text-[11px] font-bold whitespace-nowrap text-ink shadow-sm';
      name.hidden = true;
      storeLabels.push({ label: name, pin: image });
      marker.append(image, name);
      marker.onclick = () => {
        navigate(`/explore/cafes/${store.storeId}`, {
          state: { from },
        });
      };
      layers.push(
        new maps.Marker({
          map: instance,
          position: new maps.LatLng(point.lat, point.lng),
          icon: { content: marker, anchor: new maps.Point(17, 42) },
          zIndex: 4,
        }),
      );
    }
    let frame = 0;
    const updateLabels = () => {
      const zoom = instance.getZoom();
      const occupied: MapLabelRect[] = [];
      const bounds = container.current?.getBoundingClientRect();
      if (!bounds) return;
      const pins = storeLabels.map(({ pin }) => pin.getBoundingClientRect());
      const storeNames = storeLabels.flatMap(({ label }) => {
        label.hidden = zoom < 16;
        return label.hidden ? [] : [label.getBoundingClientRect()];
      });
      // 매장 핀과 이름이 거리 배지보다 우선한다. 숨긴 배지는 클릭 영역도 함께 제거한다.
      for (const { element, marker } of streetLabels) {
        marker.setVisible(true);
        const rect = element.getBoundingClientRect();
        const overlapsStore = [...pins, ...storeNames].some((other) =>
          mapLabelsOverlap(rect, other),
        );
        marker.setVisible(!overlapsStore);
        if (!overlapsStore) occupied.push(rect);
      }
      storeLabels.forEach(({ label }, index) => {
        label.hidden = zoom < 16;
        if (label.hidden) return;
        const rect = label.getBoundingClientRect();
        label.hidden =
          rect.left < bounds.left + 4 ||
          rect.right > bounds.right - 4 ||
          rect.top < bounds.top + 4 ||
          rect.bottom > bounds.bottom - 4 ||
          occupied.some((other) => mapLabelsOverlap(rect, other)) ||
          pins.some(
            (pin, otherIndex) =>
              otherIndex !== index && mapLabelsOverlap(rect, pin),
          );
        if (!label.hidden) occupied.push(rect);
      });
    };
    const scheduleLabels = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateLabels);
    };
    for (const event of ['idle', 'zoom_changed', 'size_changed']) {
      listeners.push(maps.Event.addListener(instance, event, scheduleLabels));
    }
    scheduleLabels();
    let cleared = false;
    const cleanup = () => {
      if (cleared) return;
      cleared = true;
      window.cancelAnimationFrame(frame);
      listeners.forEach((listener) => maps.Event.removeListener(listener));
      layers.forEach((layer) => layer.setMap(null));
      if (clearLayers.current === cleanup) clearLayers.current = null;
    };
    clearLayers.current = cleanup;
    return cleanup;
  }, [
    sdk.data,
    readyMap,
    areas,
    selected?.id,
    stores,
    onSelect,
    navigate,
    from,
  ]);

  const fitSelected = useCallback(() => {
    const maps = sdk.data;
    const instance = readyMap;
    if (!maps || !instance || map.current !== instance) return;
    const points: MapCoordinate[] = [...(selected?.boundary ?? [])];
    stores.forEach((store) => {
      const point = storeCoordinate(store);
      if (point) points.push(point);
    });
    if (selected?.center) points.push(selected.center);
    if (!points.length) {
      showDefaultMap(maps, instance);
      return;
    }
    if (
      points.every(
        (point) => point.lat === points[0].lat && point.lng === points[0].lng,
      )
    ) {
      instance.updateBy(new maps.LatLng(points[0].lat, points[0].lng), 16);
    } else {
      instance.fitBounds(
        points.map(({ lat, lng }) => new maps.LatLng(lat, lng)),
        { top: 80, right: 40, bottom: 60, left: 40, maxZoom: 17 },
      );
    }
  }, [sdk.data, readyMap, selected, stores]);
  useEffect(() => {
    // 지도 크기 반영 후 이동하고, 경로·선택이 바뀌면 이전 요청은 취소한다.
    const frame = window.requestAnimationFrame(() => {
      if (!sdk.data || !readyMap || map.current !== readyMap) return;
      if (focusSelected) fitSelected();
      else showDefaultMap(sdk.data, readyMap);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusSelected, fitSelected, sdk.data, readyMap, entryKey]);

  return (
    <div
      className="bg-surface relative min-h-0 flex-1"
      aria-label="테마거리 지도"
    >
      {/* 아래 20px은 테마거리 패널이 겹치는 자리라 비워 두어 네이버 로고·저작권 표기가 가려지지 않게 한다. */}
      <div ref={container} className="absolute inset-x-0 top-0 bottom-5" />
      {(sdk.isPending || sdk.isFetching || (sdk.isSuccess && !readyMap)) &&
        !authError && (
          <p
            role="status"
            className="bg-surface absolute inset-0 grid place-items-center text-sm"
          >
            지도를 불러오는 중이에요.
          </p>
        )}
      {((sdk.isError && !sdk.isFetching) || authError) && (
        <div
          role="alert"
          className="bg-surface absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-sm"
        >
          <p>
            {authError
              ? '지도 인증을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.'
              : sdk.error?.message}
          </p>
          <Button
            type="button"
            variant="brand"
            onClick={() => {
              setAuthError(false);
              void sdk.refetch();
            }}
          >
            다시 시도
          </Button>
        </div>
      )}
      {sdk.isSuccess && readyMap && !authError && !sdk.isFetching && (
        <div className="absolute right-3 bottom-[76px] z-10 flex flex-col gap-2">
          <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
            <button
              type="button"
              aria-label="지도 확대"
              className="border-hairline grid size-11 cursor-pointer place-items-center border-b"
              onClick={() =>
                map.current?.setZoom(
                  Math.min(20, (map.current?.getZoom() ?? 14) + 1),
                )
              }
            >
              <Plus aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              aria-label="지도 축소"
              className="grid size-11 cursor-pointer place-items-center"
              onClick={() =>
                map.current?.setZoom(
                  Math.max(7, (map.current?.getZoom() ?? 14) - 1),
                )
              }
            >
              <Minus aria-hidden className="size-5" />
            </button>
          </div>
          <button
            type="button"
            aria-label={
              selected ? '선택한 거리로 지도 이동' : '대구 지도로 돌아가기'
            }
            onClick={fitSelected}
            className="grid size-11 cursor-pointer place-items-center rounded-full bg-white shadow-md"
          >
            <img src={recenter} alt="" width={25} height={25} />
          </button>
        </div>
      )}
    </div>
  );
}
