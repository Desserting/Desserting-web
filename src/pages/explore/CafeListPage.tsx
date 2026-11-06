import { ChevronRight, LayoutGrid } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  cafeKeys,
  fetchCafeThemes,
  fetchAreaStores,
  type CafeStore,
} from '@/api/cafeBooking';
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';
import { CAFE_FILTERS, findCafeArea } from './cafeAreas';
import { dessertLabel } from '@/lib/dessert';
import CafeImage from './CafeImage';
import CafeRequestState from './CafeRequestState';

function CafeCard({ cafe, from }: { cafe: CafeStore; from: string }) {
  return (
    <li className="border-cafe-list-border rounded-[15px] border bg-white transition-colors active:bg-surface">
      <Link
        to={`/explore/cafes/${cafe.storeId}`}
        state={{ from }}
        aria-label={`${cafe.name} 상세 보기`}
        className="focus-visible:outline-mint-deep flex min-h-[92px] items-center gap-[14px] rounded-[15px] py-3 pr-3 pl-3 focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <div className="bg-cafe-bakery size-[68px] shrink-0 overflow-hidden rounded-2xl">
          <CafeImage
            src={cafe.coverImageUrl}
            alt={`${cafe.name} 대표 메뉴`}
            className="size-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-[17px] leading-6 font-bold break-keep">
            {cafe.name}
          </h2>
          <p className="text-ink-muted mt-1 truncate text-[13px] leading-5">
            {cafe.dessertTypes.map(dessertLabel).join(' · ')}
            {cafe.distanceKm != null && ` · ${cafe.distanceKm.toFixed(1)}km`}
          </p>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="text-ink-muted size-5 shrink-0"
        />
      </Link>
    </li>
  );
}

export default function CafeListPage() {
  const { areaId } = useParams();
  const themes = useQuery({
    queryKey: cafeKeys.themes,
    queryFn: fetchCafeThemes,
  });
  const legacyArea = findCafeArea(areaId);
  const area = themes.data?.find(
    (theme) =>
      String(theme.id) === areaId ||
      (legacyArea &&
        theme.name.replaceAll(' ', '').replaceAll('카페', '') ===
          legacyArea.name.replaceAll(' ', '').replaceAll('카페', '')),
  );
  const stores = useQuery({
    queryKey: cafeKeys.stores(area?.id ?? 0),
    queryFn: () => fetchAreaStores(area!.id),
    enabled: !!area,
  });
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFilter =
    CAFE_FILTERS.find((filter) => filter.id === searchParams.get('category'))
      ?.id ?? 'all';
  const cafes = stores.data ?? [];

  if (themes.isPending || themes.isError)
    return (
      <main className="text-ink min-h-dvh px-6">
        <PageHeader
          title="매장 목록"
          backTo={area ? `/explore?theme=${area.id}` : '/explore'}
        />
        <CafeRequestState
          pending={themes.isPending}
          error={themes.error}
          onRetry={() => void themes.refetch()}
        />
      </main>
    );

  if (!area) {
    return (
      <main className="text-ink flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-[23px] font-bold">구역을 찾을 수 없어요</h1>
        <Button asChild variant="brand">
          <Link to="/explore">카페 지도로 돌아가기</Link>
        </Button>
      </main>
    );
  }

  return (
    <div className="text-ink flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      <main className="flex min-h-0 flex-1 flex-col px-6">
        <PageHeader
          title={area.name}
          backTo={`/explore?theme=${area.id}`}
          className="pb-3"
        />
        <p className="bg-premium-emblem text-mint-deep flex h-6 shrink-0 items-center rounded-full px-3 text-[11px] leading-4">
          지도에서 선택한 테마거리의 제휴매장 목록
        </p>
        <Tabs
          value={selectedFilter}
          onValueChange={(value) =>
            setSearchParams(value === 'all' ? {} : { category: value }, {
              replace: true,
            })
          }
          className="mt-[9px] min-h-0 flex-1 [scrollbar-width:none] gap-0 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          <h2
            id="cafe-category-label"
            className="shrink-0 text-[13px] leading-5 font-bold"
          >
            디저트 카테고리
          </h2>
          <TabsList
            aria-labelledby="cafe-category-label"
            className="mt-[5px] grid w-full shrink-0 grid-cols-3 gap-1.5 bg-transparent p-0 group-data-horizontal/tabs:h-auto"
          >
            {CAFE_FILTERS.map((filter) => (
              <TabsTrigger
                key={filter.id}
                value={filter.id}
                className="bg-surface text-ink data-[state=active]:bg-premium-emblem flex h-[84px] cursor-pointer flex-col gap-1 rounded-[14px] border-0 p-1.5 text-[11px] leading-4 font-bold break-keep shadow-none after:hidden"
              >
                <span
                  aria-hidden="true"
                  className="flex h-[42px] shrink-0 items-center justify-center"
                >
                  {filter.image ? (
                    <img
                      src={filter.image}
                      alt=""
                      className="size-12 max-w-none shrink-0"
                    />
                  ) : (
                    <LayoutGrid
                      className="text-mint-deep !size-8 fill-current"
                      strokeWidth={0}
                    />
                  )}
                </span>
                <span
                  className={
                    filter.id === 'all' ? 'text-sm leading-5' : undefined
                  }
                >
                  {filter.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {CAFE_FILTERS.map((filter) => {
            const items =
              filter.id === 'all'
                ? cafes
                : cafes.filter((cafe) => cafe.dessertTypes.includes(filter.id));
            return (
              <TabsContent
                key={filter.id}
                value={filter.id}
                className="mt-3 flex-none pb-6"
              >
                <h2
                  aria-live="polite"
                  className="mb-2 text-[15px] leading-6 font-bold"
                >
                  제휴매장 {items.length}곳
                </h2>
                {stores.isPending || stores.isError ? (
                  <CafeRequestState
                    pending={stores.isPending}
                    error={stores.error}
                    onRetry={() => void stores.refetch()}
                  />
                ) : items.length > 0 ? (
                  <ul
                    aria-label={`${area.name} ${filter.label} 카페 목록`}
                    className="grid gap-3"
                  >
                    {items.map((cafe) => (
                      <CafeCard
                        key={cafe.storeId}
                        cafe={cafe}
                        from={`${location.pathname}${location.search}`}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-muted py-12 text-center text-base">
                    {cafes.length === 0
                      ? '아직 등록된 카페가 없어요.'
                      : '이 카테고리에 해당하는 매장이 없어요.'}
                  </p>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
      <BottomNav activePath="/explore" />
    </div>
  );
}
