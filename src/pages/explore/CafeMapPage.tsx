import BottomNav from '@/components/BottomNav';
import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  cafeKeys,
  fetchCafeThemeDetail,
  fetchCafeThemes,
  positiveId,
  type CafeStore,
} from '@/api/cafeBooking';
import {
  useLocation,
  useNavigationType,
  useSearchParams,
} from 'react-router-dom';
import CafeRequestState from './CafeRequestState';
import PageHeader from '@/components/PageHeader';
import CafeThemeMap from './CafeThemeMap';
import ThemeStreetDrawer, { ThemeStreetPicker } from './ThemeStreetDrawer';
import { useBookingFlow } from '@/lib/bookingFlow';

const EMPTY_STORES: CafeStore[] = [];

export default function CafeMapPage() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const mapPath = `${location.pathname}${location.search}`;
  const [params, setParams] = useSearchParams();
  const { bookingFrom, exitBooking } = useBookingFlow();
  const themes = useQuery({
    queryKey: cafeKeys.themes,
    queryFn: fetchCafeThemes,
  });
  const areas = useMemo(
    () => themes.data?.filter((area) => area.isActive) ?? [],
    [themes.data],
  );
  const selectedArea = areas.find(
    (area) => area.id === positiveId(params.get('theme')),
  );
  const stores = useQuery({
    queryKey: cafeKeys.theme(selectedArea?.id ?? 0),
    queryFn: () => fetchCafeThemeDetail(selectedArea!.id),
    enabled: selectedArea !== undefined,
  });
  const selected = selectedArea
    ? (stores.data?.themeStreet ?? selectedArea)
    : undefined;
  const mapAreas = useMemo(
    () => areas.map((area) => (area.id === selected?.id ? selected : area)),
    [areas, selected],
  );
  const select = useCallback(
    (id: number) => {
      const next = new URLSearchParams(params);
      next.set('theme', String(id));
      setParams(next, { replace: true, state: location.state });
    },
    [params, setParams, location.state],
  );
  const listPath = `/explore/areas/${selected?.id}/cafes`;
  const selectedStores = stores.isSuccess ? stores.data.stores : EMPTY_STORES;

  return (
    <div className="text-ink flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <div className="shrink-0 px-6">
        <PageHeader
          className="pb-4"
          title="카페 지도"
          backTo={bookingFrom}
          onBack={exitBooking}
        />
      </div>
      <main
        aria-label="카페 지도 영역"
        className="flex min-h-0 flex-1 flex-col"
      >
        <CafeThemeMap
          entryKey={location.key}
          areas={mapAreas}
          selected={selected}
          focusSelected={
            navigationType === 'REPLACE' &&
            selected?.id === positiveId(params.get('theme'))
          }
          stores={selectedStores}
          onSelect={select}
          from={mapPath}
        />
        <ThemeStreetDrawer>
          {themes.isPending || themes.isError ? (
            <CafeRequestState
              pending={themes.isPending}
              error={themes.error}
              onRetry={() => void themes.refetch()}
            />
          ) : areas.length === 0 ? (
            <p className="text-my-muted py-6 text-sm">
              등록된 테마거리가 없어요.
            </p>
          ) : (
            <ThemeStreetPicker
              areas={mapAreas}
              selected={selected}
              onSelect={select}
              listPath={listPath}
              selectedStoreCount={
                stores.isSuccess ? selectedStores.length : null
              }
              notice={
                selected && stores.isError ? (
                  <CafeRequestState
                    pending={false}
                    error={stores.error}
                    onRetry={() => void stores.refetch()}
                  />
                ) : null
              }
            />
          )}
        </ThemeStreetDrawer>
      </main>
      <BottomNav />
    </div>
  );
}
