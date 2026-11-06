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
  Link,
  useLocation,
  useNavigationType,
  useSearchParams,
} from 'react-router-dom';
import CafeRequestState from './CafeRequestState';
import CafePageHeader from './CafePageHeader';
import CafeThemeMap from './CafeThemeMap';
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
      <header className="flex h-[clamp(88px,14dvh,112px)] shrink-0 items-end justify-center px-6 pb-5">
        {bookingFrom ? (
          <div className="w-full">
            <CafePageHeader
              title="카페 지도"
              backTo={bookingFrom}
              onBack={exitBooking}
            />
          </div>
        ) : (
          <h1 className="text-center text-[23px] leading-[34px] font-bold">
            카페 지도
          </h1>
        )}
      </header>
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
        <section
          aria-label="선택한 테마거리"
          className="shrink-0 bg-white px-[18px] py-1.5"
        >
          {themes.isPending || themes.isError ? (
            <CafeRequestState
              pending={themes.isPending}
              error={themes.error}
              onRetry={() => void themes.refetch()}
            />
          ) : areas.length === 0 ? (
            <p className="text-my-muted text-sm">등록된 테마거리가 없어요.</p>
          ) : !selected ? (
            <>
              <h2 className="text-ink flex min-h-6 items-center text-base font-bold">
                테마거리를 선택해 주세요
              </h2>
              <p className="text-my-muted mt-1 text-sm leading-5">
                지도에서 거리 이름이나 구역을 누르면 제휴매장을 볼 수 있어요.
              </p>
            </>
          ) : (
            <>
              <div className="flex min-h-6 items-center justify-between gap-2">
                <h2 className="min-w-0 flex-1 text-base font-bold text-[#142929]">
                  {selected.name}
                </h2>
                <span className="text-[10px] whitespace-nowrap text-[#5c6e6e]">
                  제휴매장{' '}
                  {selected.storeCount !== null
                    ? `${selected.storeCount}곳`
                    : stores.isSuccess
                      ? `${selectedStores.length}곳`
                      : '—'}
                </span>
              </div>
              {stores.isPending || stores.isError ? (
                <CafeRequestState
                  pending={stores.isPending}
                  error={stores.error}
                  onRetry={() => void stores.refetch()}
                />
              ) : selectedStores.length === 0 ? (
                <p className="text-my-muted mt-2 text-sm">
                  등록된 제휴매장이 없어요.
                </p>
              ) : null}
              <div className="text-mint-deep mt-1 flex min-h-9 items-center justify-between gap-3">
                <p className="min-w-0 flex-1 text-sm leading-5">
                  지도에서 선택한 거리의 매장을 확인해요
                </p>
                <Link
                  to={listPath}
                  className="focus-visible:outline-mint-deep shrink-0 rounded py-1.5 text-sm font-semibold focus-visible:outline-2"
                >
                  목록 보기 ›
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
