import { useQuery } from '@tanstack/react-query';
import { MapPin, Store, Tag } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  fetchStores,
  fetchThemeStreets,
  storeKeys,
  type StoreCard,
} from '@/api/stores';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { DESSERT_LABELS, dessertLabel } from '@/lib/dessert';
import { cn } from '@/lib/utils';

const DESSERT_CODES = Object.keys(DESSERT_LABELS);

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'h-9 shrink-0 cursor-pointer rounded-full px-4 text-[14px] leading-5 font-bold whitespace-nowrap',
        selected ? 'bg-mint-100 text-mint-deep' : 'bg-chip text-ink',
      )}
    >
      {children}
    </button>
  );
}

function StoreItem({ store, from }: { store: StoreCard; from: string }) {
  const dessertTypes = store.dessertTypes ?? [];

  return (
    <li className="border-hairline rounded-[20px] border bg-white shadow-[0_2px_10px_rgba(17,17,17,0.05)] transition-transform has-[a:active]:scale-[0.98]">
      <Link
        to={`/stores/${store.storeId}`}
        state={{ from }}
        className="flex items-center gap-4 p-4"
      >
        <span className="bg-chip flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl">
          {store.coverImageUrl ? (
            <img
              src={store.coverImageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <Store aria-hidden className="text-ink-muted size-7" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[19px] leading-7 font-bold">
            {store.name}
          </span>
          <span className="text-ink-muted mt-0.5 flex items-center gap-1 text-[14px] leading-5">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">
              {store.themeStreetName ?? store.address ?? '위치 정보 없음'}
              {typeof store.distanceKm === 'number' &&
                ` · ${store.distanceKm.toFixed(1)}km`}
            </span>
          </span>
          {store.representativeMenuName && (
            <span className="text-ink-muted mt-0.5 block truncate text-[13px] leading-5">
              대표 메뉴 {store.representativeMenuName}
            </span>
          )}
          {dessertTypes.length > 0 && (
            <span className="mt-2 flex flex-wrap gap-1.5">
              {dessertTypes.map((type, index) => (
                <span
                  key={type}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs leading-5 font-medium',
                    index === 0
                      ? 'bg-mint-100 text-mint-deep'
                      : 'bg-chip text-ink-muted',
                  )}
                >
                  {dessertLabel(type)}
                </span>
              ))}
            </span>
          )}
          {store.partnerDiscountNotice && (
            <span className="text-mint-deep mt-2 flex items-start gap-1 text-[12px] leading-[18px] font-medium">
              <Tag aria-hidden className="mt-0.5 size-3 shrink-0" />
              <span className="line-clamp-2">
                {store.partnerDiscountNotice}
              </span>
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

export default function StoresPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // 상세를 보고 돌아와도 고른 필터가 유지되도록 URL에 둔다
  const streetParam = Number(searchParams.get('street'));
  const themeStreetId =
    Number.isInteger(streetParam) && streetParam > 0 ? streetParam : undefined;
  const dessertParam = searchParams.get('dessert');
  const dessertType =
    dessertParam && DESSERT_CODES.includes(dessertParam)
      ? dessertParam
      : undefined;

  const themes = useQuery({
    queryKey: storeKeys.themes,
    queryFn: fetchThemeStreets,
  });
  const params = { themeStreetId, dessertType };
  const stores = useQuery({
    queryKey: storeKeys.search(params),
    queryFn: () => fetchStores(params),
  });

  const select = (key: 'street' | 'dessert', value: string | number | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null) next.delete(key);
    else next.set(key, String(value));
    setSearchParams(next, { replace: true });
  };

  const activeThemes = (themes.data ?? []).filter(
    (theme) => theme.isActive !== false,
  );
  const from = location.pathname + location.search;

  return (
    <>
      <main className="text-ink relative flex flex-1 flex-col bg-white px-6 pb-6">
        <PageHeader title="제휴매장 보기" backTo="/home" />
        <p className="text-ink-muted mt-4 text-center text-[14px] leading-5">
          디저팅과 제휴한 카페만 모아 보여드려요
        </p>

        {activeThemes.length > 0 && (
          <section aria-label="테마거리" className="mt-5">
            <div className="-mx-6 flex [scrollbar-width:none] gap-2 overflow-x-auto px-6 [&::-webkit-scrollbar]:hidden">
              <FilterChip
                selected={themeStreetId === undefined}
                onClick={() => select('street', null)}
              >
                전체 거리
              </FilterChip>
              {activeThemes.map((theme) => (
                <FilterChip
                  key={theme.id}
                  selected={themeStreetId === theme.id}
                  onClick={() => select('street', theme.id)}
                >
                  {theme.name}
                </FilterChip>
              ))}
            </div>
          </section>
        )}

        <section
          aria-label="디저트 종류"
          className={activeThemes.length > 0 ? 'mt-2' : 'mt-5'}
        >
          <div className="-mx-6 flex [scrollbar-width:none] gap-2 overflow-x-auto px-6 [&::-webkit-scrollbar]:hidden">
            <FilterChip
              selected={dessertType === undefined}
              onClick={() => select('dessert', null)}
            >
              전체
            </FilterChip>
            {DESSERT_CODES.map((code) => (
              <FilterChip
                key={code}
                selected={dessertType === code}
                onClick={() => select('dessert', code)}
              >
                {dessertLabel(code)}
              </FilterChip>
            ))}
          </div>
        </section>

        {stores.isPending && (
          <div role="status" className="mt-6 flex flex-col gap-3">
            <span className="sr-only">제휴매장을 불러오는 중이에요</span>
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                aria-hidden
                className="border-hairline flex animate-pulse items-center gap-4 rounded-[20px] border p-4"
              >
                <div className="bg-chip size-[72px] shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <div className="bg-chip h-5 w-2/5 rounded-full" />
                  <div className="bg-chip h-4 w-3/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {stores.isError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-24">
            <p className="text-ink-muted text-[16px] leading-6">
              제휴매장을 불러오지 못했어요.
            </p>
            <Button
              type="button"
              variant="brand"
              onClick={() => void stores.refetch()}
              className="h-11 cursor-pointer rounded-[12px] px-6 text-[16px] font-bold"
            >
              다시 시도
            </Button>
          </div>
        )}

        {stores.isSuccess && stores.data.length === 0 && (
          <p className="text-ink-muted mt-32 text-center text-[15px] leading-6">
            {themeStreetId !== undefined || dessertType !== undefined
              ? '조건에 맞는 제휴매장이 없어요'
              : '아직 등록된 제휴매장이 없어요'}
          </p>
        )}

        {stores.isSuccess && stores.data.length > 0 && (
          <>
            <p
              aria-live="polite"
              className="text-ink-muted mt-6 text-sm leading-5"
            >
              제휴매장 <b className="text-mint-deep">{stores.data.length}곳</b>
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {stores.data.map((store) => (
                <StoreItem key={store.storeId} store={store} from={from} />
              ))}
            </ul>
          </>
        )}
      </main>
      <BottomNav activePath="/home" />
    </>
  );
}
