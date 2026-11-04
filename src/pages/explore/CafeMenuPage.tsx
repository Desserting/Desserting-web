import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CafeNotFound from './CafeNotFound';
import CafePageHeader from './CafePageHeader';
import { findCafe } from './cafes';
import type { CafeNavigationState } from './cafeNavigation';
import {
  formatMenuPrice,
  getCafeMenu,
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
    <li className="grid min-h-[108px] grid-cols-[82px_minmax(0,1fr)] gap-4">
      {item.imageType === 'photo' ? (
        <img
          src={item.image}
          alt={item.name}
          width={82}
          height={88}
          className="h-[88px] w-[82px] rounded-xl object-cover"
        />
      ) : (
        <div className="bg-cafe-menu-image relative h-[88px] w-[82px] overflow-hidden rounded-xl">
          <img
            src={item.image}
            alt={item.name}
            className="absolute top-2.5 left-0"
          />
        </div>
      )}
      <div className="min-w-0 pt-[3px]">
        <h2 className="text-lg leading-[27px] font-bold break-words">
          {item.name}
        </h2>
        <p className="mt-[5px] text-base leading-6">
          {formatMenuPrice(item.price)}
        </p>
        <div
          role="group"
          aria-label={`${item.name} 수량 선택`}
          className="bg-cafe-field mt-[11px] ml-auto grid h-[37px] w-[121px] max-w-full grid-cols-3 items-center rounded-[9px] text-center text-base font-bold"
        >
          <button
            type="button"
            aria-label={`${item.name} 수량 줄이기`}
            disabled={quantity === 0}
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
            onClick={() => onQuantityChange(quantity + 1)}
            className="focus-visible:outline-mint-deep h-full cursor-pointer rounded-[9px] focus-visible:outline-2"
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
  const cafe = findCafe(cafeId);
  const menu = getCafeMenu(cafeId ?? '');
  const location = useLocation();
  const navigationState = location.state as CafeNavigationState | null;
  const from = navigationState?.from;
  const reservation = navigationState?.reservation;
  const backState = {
    ...(from?.startsWith('/') && !from.startsWith('//') ? { from } : {}),
    ...(reservation ? { reservation } : {}),
    ...(navigationState?.order ? { order: navigationState.order } : {}),
  } satisfies CafeNavigationState;
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    getMenuQuantities(menu, navigationState?.order?.quantities),
  );
  const [category, setCategory] = useState<MenuCategory>(
    navigationState?.order?.category ?? 'dessert',
  );
  const { count: totalCount, price: totalPrice } = getMenuTotals(
    menu,
    quantities,
  );

  if (!cafe) return <CafeNotFound />;

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pt-[clamp(32px,8dvh,68px)] pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <CafePageHeader
        title="메뉴 선택"
        backTo={
          reservation
            ? `/explore/cafes/${cafe.id}/reservation`
            : `/explore/cafes/${cafe.id}`
        }
        backState={{ ...backState, order: { quantities, category } }}
      />
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
          disabled
          className="mt-6 cursor-pointer rounded-[13px] pb-0 text-lg"
        >
          주문하기
        </Button>
      </div>
    </main>
  );
}
