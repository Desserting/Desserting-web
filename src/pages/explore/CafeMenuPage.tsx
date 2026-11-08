import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  cafeKeys,
  fetchCafeDetail,
  fetchCafeReservation,
  positiveId,
} from '@/api/cafeBooking';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CafeNotFound from './CafeNotFound';
import PageHeader from '@/components/PageHeader';
import CafeRequestState from './CafeRequestState';
import CafeImage from './CafeImage';
import SoldOutMenuNotice from '@/components/SoldOutMenuNotice';
import { cn } from '@/lib/utils';
import type { CafeNavigationState } from './cafeNavigation';
import {
  formatMenuPrice,
  toCafeMenu,
  getMenuQuantities,
  getMenuTotals,
  MENU_CATEGORIES,
  type CafeMenuItem,
  type MenuCategory,
} from './cafeMenus';

function MenuItem({
  item,
  quantity,
  onQuantityChange,
}: {
  item: CafeMenuItem;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}) {
  return (
    <li className="relative grid min-h-[108px] grid-cols-[82px_minmax(0,1fr)] gap-4">
      <CafeImage
        src={item.image}
        alt={item.name}
        className={cn(
          'h-[88px] w-[82px] rounded-xl object-cover',
          item.soldOut && 'opacity-60 grayscale',
        )}
      />
      <div className="min-w-0 pt-[3px]">
        <h2 className="text-lg leading-[27px] font-bold break-words">
          {item.name}
          {item.soldOut && (
            <span className="bg-cafe-field text-my-muted ml-2 rounded px-2 py-1 text-xs">
              품절
            </span>
          )}
        </h2>
        <p className="mt-[5px] text-base leading-6">
          {formatMenuPrice(item.price)}
        </p>
        <div
          role="group"
          aria-label={`${item.name} 수량 선택`}
          className="bg-cafe-field relative mt-[11px] ml-auto grid h-[37px] w-[121px] max-w-full grid-cols-3 items-center rounded-[9px] text-center text-base font-bold"
        >
          {item.soldOut && <SoldOutMenuNotice name={item.name} />}
          <button
            type="button"
            aria-label={`${item.name} 수량 줄이기`}
            disabled={quantity === 0 || item.soldOut}
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            className="focus-visible:outline-mint-deep h-full cursor-pointer rounded-[9px] focus-visible:outline-2 disabled:cursor-default disabled:opacity-30"
          >
            <span aria-hidden="true">−</span>
          </button>
          <output aria-label={`${item.name} 수량`} aria-live="polite">
            {quantity}
          </output>
          <button
            type="button"
            aria-label={`${item.name} 수량 늘리기`}
            disabled={item.soldOut || quantity >= 20}
            onClick={() => onQuantityChange(quantity + 1)}
            className="focus-visible:outline-mint-deep h-full cursor-pointer rounded-[9px] focus-visible:outline-2 disabled:cursor-default disabled:opacity-30"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export default function CafeMenuPage() {
  const { cafeId } = useParams();
  const storeId = positiveId(cafeId);
  const detail = useQuery({
    queryKey: cafeKeys.detail(storeId),
    queryFn: () => fetchCafeDetail(storeId),
    enabled: !!storeId,
    refetchInterval: 10000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });
  const cafe = detail.data;
  const menu = toCafeMenu(cafe?.menus ?? []);
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = location.state as CafeNavigationState | null;
  const [searchParams] = useSearchParams();
  const reservationId = positiveId(
    searchParams.get('reservationId') ?? navigationState?.reservationId,
  );
  const currentReservation = useQuery({
    queryKey: cafeKeys.reservation(reservationId),
    queryFn: () => fetchCafeReservation(reservationId),
    enabled: !!reservationId,
  });
  const from = navigationState?.from;
  const reservation = navigationState?.reservation;
  const backState = {
    reservationId: reservationId || undefined,
    ...(from?.startsWith('/') && !from.startsWith('//') ? { from } : {}),
    ...(reservation ? { reservation } : {}),
    ...(navigationState?.order ? { order: navigationState.order } : {}),
  } satisfies CafeNavigationState;
  const [draftQuantities, setQuantities] = useState<Record<string, number>>(
    navigationState?.order?.quantities ?? {},
  );
  const quantities = getMenuQuantities(menu, draftQuantities);
  const soldOutSelection = menu.some(
    (item) => item.soldOut && (draftQuantities[item.id] ?? 0) > 0,
  );
  const [category, setCategory] = useState<MenuCategory>(
    navigationState?.order?.category ?? 'dessert',
  );
  const { count: totalCount, price: totalPrice } = getMenuTotals(
    menu,
    quantities,
  );

  if (!storeId) return <CafeNotFound />;
  if (
    detail.isPending ||
    detail.isError ||
    (reservationId &&
      (currentReservation.isPending || currentReservation.isError))
  )
    return (
      <main className="min-h-dvh px-6">
        <PageHeader
          title="메뉴 선택"
          backTo={`/explore/cafes/${storeId}`}
          backState={backState}
        />
        <CafeRequestState
          pending={
            detail.isPending ||
            (!!reservationId && currentReservation.isPending)
          }
          error={detail.error ?? currentReservation.error}
          onRetry={() => {
            void detail.refetch();
            if (reservationId) void currentReservation.refetch();
          }}
        />
      </main>
    );
  if (
    !cafe ||
    (currentReservation.data && currentReservation.data.storeId !== storeId)
  )
    return <CafeNotFound />;
  const blocked =
    currentReservation.data?.status === 'CANCELLED' ||
    currentReservation.data?.status === 'COMPLETED';
  const itemCount = Object.values(quantities).filter(
    (count) => count > 0,
  ).length;

  const goToPayment = () => {
    const state = {
      ...backState,
      order: { quantities, category },
    } satisfies CafeNavigationState;
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state,
    });
    navigate(
      reservationId
        ? `/explore/cafes/${cafe.storeId}/payment?reservationId=${reservationId}`
        : `/explore/cafes/${cafe.storeId}/reservation`,
      { state },
    );
  };

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <PageHeader
        title="메뉴 선택"
        backTo={
          reservationId
            ? `/explore/cafes/${cafe.storeId}/reservation?reservationId=${reservationId}`
            : `/explore/cafes/${cafe.storeId}`
        }
        backState={{ ...backState, order: { quantities, category } }}
      />
      {soldOutSelection && (
        <p role="status" className="text-my-muted mt-3 text-sm">
          선택한 메뉴 중 품절된 메뉴를 주문에서 제외했어요.
        </p>
      )}
      <Tabs
        value={category}
        onValueChange={(value) => setCategory(value as MenuCategory)}
        className="mt-[30px] gap-0"
      >
        <TabsList
          aria-label="메뉴 카테고리"
          className="grid w-full grid-cols-3 gap-2.5 bg-transparent p-0 group-data-horizontal/tabs:h-[42px]"
        >
          {MENU_CATEGORIES.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="bg-chip text-ink data-[state=active]:bg-cafe-menu-selected h-[42px] cursor-pointer rounded-xl text-[15px] leading-6 font-bold shadow-none after:hidden"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {MENU_CATEGORIES.map((category) => {
          const items = menu.filter((item) => item.category === category.id);
          return (
            <TabsContent
              key={category.id}
              value={category.id}
              className="mt-[38px]"
            >
              {items.length > 0 ? (
                <ul
                  aria-label={`${category.label} 메뉴`}
                  className="grid gap-[38px]"
                >
                  {items.map((item) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      quantity={quantities[item.id] ?? 0}
                      onQuantityChange={(quantity) =>
                        setQuantities((current) => ({
                          ...current,
                          [item.id]: quantity,
                        }))
                      }
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-ink-muted py-10 text-center text-base">
                  등록된 {category.label} 메뉴가 없어요.
                </p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="mt-auto pt-8">
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex items-center justify-between gap-3"
        >
          <p className="text-[21px] leading-8 font-bold">총 {totalCount}개</p>
          <p className="text-right text-[26px] leading-[39px] font-bold tabular-nums">
            {formatMenuPrice(totalPrice)}
          </p>
        </div>
        <Button
          type="button"
          variant="brand"
          size="xl"
          disabled={totalCount === 0 || itemCount > 20 || blocked}
          onClick={goToPayment}
          className="mt-6 cursor-pointer rounded-[13px] pb-0 text-lg"
        >
          {reservationId ? '주문하기' : '날짜·시간 선택'}
        </Button>
        {itemCount > 20 && (
          <p role="alert" className="text-destructive mt-2 text-sm">
            메뉴는 한 번에 20종류까지 주문할 수 있어요.
          </p>
        )}
        {blocked && (
          <p role="alert" className="text-destructive mt-2 text-sm">
            취소되었거나 완료된 예약은 주문할 수 없어요.
          </p>
        )}
      </div>
    </main>
  );
}
