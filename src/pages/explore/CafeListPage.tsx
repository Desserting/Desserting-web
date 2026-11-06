import { Heart, LayoutGrid } from 'lucide-react';
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
import heart from '@/assets/cafes/list-heart.svg';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCafeStore } from '@/stores/cafeStore';
import CafePageHeader from './CafePageHeader';
import { CAFE_FILTERS, findCafeArea } from './cafeAreas';
import { dessertLabel } from '@/lib/dessert';
import CafeImage from './CafeImage';
import CafeRequestState from './CafeRequestState';
import { getBookingFrom, type CafeNavigationState } from './cafeNavigation';

function CafeCard({
  cafe,
  from,
  bookingFrom,
}: {
  cafe: CafeStore;
  from: string;
  bookingFrom?: string;
}) {
  const cafeId = String(cafe.storeId);
  const liked = useCafeStore((state) => state.likedIds.includes(cafeId));
  const toggleLike = useCafeStore((state) => state.toggleLike);

  return (
    <li className="border-cafe-list-border relative h-[88px] rounded-[15px] border bg-white">
      <Link
        to={`/explore/cafes/${cafe.storeId}`}
        state={{ from, bookingFrom }}
        aria-label={`${cafe.name} 상세 보기`}
        className="focus-visible:outline-mint-deep flex h-full items-center gap-[14px] rounded-[15px] py-2.5 pr-10 pl-2.5 focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <div className="bg-cafe-bakery size-[66px] shrink-0 overflow-hidden rounded-2xl">
          <CafeImage
            src={cafe.coverImageUrl}
            alt={`${cafe.name} 대표 메뉴`}
            className="size-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[19px] leading-7 font-bold">
            {cafe.name}
          </h2>
          <p className="mt-2 truncate text-[13px] leading-5">
            {cafe.dessertTypes.map(dessertLabel).join(' · ')}
            {cafe.distanceKm != null && ` · ${cafe.distanceKm.toFixed(1)}km`}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`${cafe.name} ${liked ? '좋아요 취소' : '좋아요'}`}
        aria-pressed={liked}
        onClick={() => toggleLike(cafeId)}
        className="focus-visible:outline-mint-deep absolute top-1/2 right-0.5 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2"
      >
        {liked ? (
          <Heart
            aria-hidden="true"
            className="fill-mint-deep text-mint-deep size-[23px]"
            strokeWidth={1.8}
          />
        ) : (
          <img src={heart} alt="" />
        )}
      </button>
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
  const bookingFrom = getBookingFrom(
    location.state as CafeNavigationState | null,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFilter =
    CAFE_FILTERS.find((filter) => filter.id === searchParams.get('category'))
      ?.id ?? 'all';
  const cafes = stores.data ?? [];

  if (themes.isPending || themes.isError)
    return (
      <main className="text-ink min-h-dvh px-6 pt-16">
        <CafePageHeader
          title="매장 목록"
          backTo={area ? `/explore?theme=${area.id}` : '/explore'}
          backState={{ bookingFrom }}
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
      <main className="flex min-h-0 flex-1 flex-col px-6 pt-[clamp(32px,8dvh,68px)]">
        <CafePageHeader
          title={`${area.name} (${cafes.length}) · 선택됨`}
          backTo={`/explore?theme=${area.id}`}
          backState={{ bookingFrom }}
          titleClassName="w-full truncate pl-9 text-[20px] tracking-[-0.5px]"
        />
        <p className="bg-premium-emblem text-mint-deep flex h-[21px] shrink-0 items-center rounded-full px-2.5 text-[10px] leading-[15px]">
          지도에서 선택한 테마거리의 제휴매장 목록
        </p>
        <Tabs
          value={selectedFilter}
          onValueChange={(value) =>
            setSearchParams(value === 'all' ? {} : { category: value }, {
              replace: true,
              state: { bookingFrom },
            })
          }
          className="mt-[9px] min-h-0 flex-1 [scrollbar-width:none] gap-0 overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          <h2
            id="cafe-category-label"
            className="shrink-0 text-xs leading-[18px] font-bold"
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
                className="bg-surface text-ink data-[state=active]:bg-premium-emblem flex h-[78px] cursor-pointer flex-col gap-1 rounded-[14px] border-0 p-1.5 text-[10px] leading-[15px] font-bold shadow-none after:hidden"
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
                  className="mb-[5px] text-sm leading-5 font-bold"
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
                    className="grid gap-[18px]"
                  >
                    {items.map((cafe) => (
                      <CafeCard
                        key={cafe.storeId}
                        cafe={cafe}
                        from={`${location.pathname}${location.search}`}
                        bookingFrom={bookingFrom}
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
      {!bookingFrom && <BottomNav activePath="/explore" />}
    </div>
  );
}
