import BottomNav from '@/components/BottomNav';
import { useQuery } from '@tanstack/react-query';
import {
  cafeKeys,
  fetchAreaStores,
  fetchCafeThemes,
  positiveId,
} from '@/api/cafeBooking';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import CafeRequestState from './CafeRequestState';
import CafePageHeader from './CafePageHeader';
import CafeThemeMap from './CafeThemeMap';
import { getBookingFrom, type CafeNavigationState } from './cafeNavigation';

export default function CafeMapPage() {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const bookingFrom = getBookingFrom(
    location.state as CafeNavigationState | null,
  );
  const themes = useQuery({
    queryKey: cafeKeys.themes,
    queryFn: fetchCafeThemes,
  });
  const areas = themes.data?.filter((area) => area.isActive) ?? [];
  const defaultArea =
    areas.find((area) => area.name.includes('앞산')) ?? areas[0];
  const selected =
    areas.find((area) => area.id === positiveId(params.get('theme'))) ??
    defaultArea;
  const stores = useQuery({
    queryKey: cafeKeys.stores(selected?.id ?? 0),
    queryFn: () => fetchAreaStores(selected!.id),
    enabled: selected !== undefined,
  });
  const select = (id: number) => {
    const next = new URLSearchParams(params);
    next.set('theme', String(id));
    setParams(next, { replace: true, state: location.state });
  };
  const listPath = `/explore/areas/${selected?.id}/cafes`;
  const mapPath = `${location.pathname}${location.search}`;
  const selectedStores = stores.isSuccess ? stores.data : [];

  return (
    <div className="text-ink flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <header className="flex h-[clamp(112px,18dvh,145px)] shrink-0 items-end justify-center px-6 pb-[28px]">
        {bookingFrom ? (
          <div className="w-full">
            <CafePageHeader title="카페 지도" backTo={bookingFrom} />
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
          areas={areas}
          selected={selected}
          stores={selectedStores}
          onSelect={select}
          onReset={() => defaultArea && select(defaultArea.id)}
          from={mapPath}
          bookingFrom={bookingFrom}
        />
        <section
          aria-label="선택한 테마거리"
          className="min-h-[132px] shrink-0 border border-[#dee8e5] bg-white px-[18px] py-3"
        >
          {themes.isPending || themes.isError ? (
            <CafeRequestState
              pending={themes.isPending}
              error={themes.error}
              onRetry={() => void themes.refetch()}
            />
          ) : !selected ? (
            <p className="text-my-muted text-sm">등록된 테마거리가 없어요.</p>
          ) : (
            <>
              <div className="flex min-h-[33px] items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#142929]">
                  {selected.name}
                </h2>
                <span className="text-[10px] whitespace-nowrap text-[#5c6e6e]">
                  제휴매장 {stores.isSuccess ? `${stores.data.length}곳` : '—'}
                </span>
              </div>
              {areas.some((area) => !/앞산|수성못|동성로/.test(area.name)) && (
                <select
                  aria-label="테마거리 선택"
                  value={selected.id}
                  onChange={(event) => select(Number(event.target.value))}
                  className="mb-1 w-full rounded border px-2 py-1 text-xs"
                >
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              )}
              {stores.isPending || stores.isError ? (
                <CafeRequestState
                  pending={stores.isPending}
                  error={stores.error}
                  onRetry={() => void stores.refetch()}
                />
              ) : (
                <p className="min-h-[29px] truncate pt-1 text-xs text-[#5c6e6e]">
                  {stores.data.length
                    ? stores.data
                        .slice(0, 2)
                        .map(
                          (store, index) =>
                            `${index === 0 ? '①' : '②'} ${store.name}`,
                        )
                        .join('　 ')
                    : '등록된 제휴매장이 없어요.'}
                </p>
              )}
              <div className="text-mint-deep flex min-h-[29px] items-center justify-between gap-2">
                <p className="text-[11px]">
                  지도에서 선택한 거리의 매장을 확인해요
                </p>
                <Link
                  to={listPath}
                  state={{ bookingFrom }}
                  className="focus-visible:outline-mint-deep shrink-0 rounded py-1 text-[10px] focus-visible:outline-2"
                >
                  목록 보기 ›
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <div aria-hidden="true" className="h-4 shrink-0" />
      <BottomNav />
    </div>
  );
}
