import { Heart } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useCafeStore } from '@/stores/cafeStore';
import CafePageHeader from './CafePageHeader';
import { CAFE_FILTERS, findCafeArea } from './cafeAreas';
import { getCafesByArea, type Cafe } from './cafes';

function CafeCard({ cafe, from }: { cafe: Cafe; from: string }) {
  const liked = useCafeStore((state) => state.likedIds.includes(cafe.id));
  const toggleLike = useCafeStore((state) => state.toggleLike);

  return (
    <li className="border-cafe-list-border relative h-28 rounded-[15px] border bg-white">
      <Link
        to={`/explore/cafes/${cafe.id}`}
        state={{ from }}
        aria-label={`${cafe.name} 상세 보기`}
        className="focus-visible:outline-mint-deep flex h-full items-start gap-[14px] rounded-[15px] py-[13px] pr-11 pl-[9px] focus-visible:outline-2 focus-visible:-outline-offset-2"
      >
        <div className="bg-cafe-bakery size-[83px] shrink-0 overflow-hidden rounded-2xl">
          <img
            src={cafe.listPhoto}
            alt={`${cafe.name} 대표 메뉴`}
            className={cn(
              'size-full object-cover',
              cafe.roundedThumbnail && 'rounded-[36px]',
            )}
          />
        </div>
        <div className="min-w-0 flex-1 pt-2.5">
          <h2 className="truncate text-[19px] leading-7 font-bold">
            {cafe.name}
          </h2>
          <p className="mt-2 truncate text-[13px] leading-5">
            {cafe.category} · {cafe.distanceKm.toFixed(1)}km
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={`${cafe.name} ${liked ? '좋아요 취소' : '좋아요'}`}
        aria-pressed={liked}
        onClick={() => toggleLike(cafe.id)}
        className="focus-visible:outline-mint-deep absolute top-[27px] right-0.5 flex size-11 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2"
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
  const area = findCafeArea(areaId);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedFilter =
    CAFE_FILTERS.find((filter) => filter.id === searchParams.get('category'))
      ?.id ?? 'all';
  const cafes = area ? getCafesByArea(area.id) : [];

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
          title={`${area.name} (${cafes.length})`}
          backTo="/explore"
          titleClassName="px-8 text-[21px]"
        />
        <Tabs
          value={selectedFilter}
          onValueChange={(value) =>
            setSearchParams(value === 'all' ? {} : { category: value }, {
              replace: true,
            })
          }
          className="mt-[23px] min-h-0 flex-1 gap-0"
        >
          <TabsList
            aria-label="카페 카테고리"
            className="grid w-full shrink-0 grid-cols-4 gap-2.5 bg-transparent p-0 group-data-horizontal/tabs:h-10"
          >
            {CAFE_FILTERS.map((filter) => (
              <TabsTrigger
                key={filter.id}
                value={filter.id}
                className="bg-chip text-ink data-[state=active]:bg-cafe-list-selected h-10 cursor-pointer rounded-xl text-sm font-bold shadow-none after:hidden"
              >
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {CAFE_FILTERS.map((filter) => {
            const items =
              filter.id === 'all'
                ? cafes
                : cafes.filter((cafe) => cafe.filters.includes(filter.id));
            return (
              <TabsContent
                key={filter.id}
                value={filter.id}
                className="mt-8 min-h-0 [scrollbar-width:none] overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden"
              >
                {items.length > 0 ? (
                  <ul
                    aria-label={`${area.name} ${filter.label} 카페 목록`}
                    className="grid gap-[18px]"
                  >
                    {items.map((cafe) => (
                      <CafeCard
                        key={cafe.id}
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
      <div className="shrink-0 pb-[max(25px,env(safe-area-inset-bottom,0px))]">
        <BottomNav activePath="/explore" />
      </div>
    </div>
  );
}
