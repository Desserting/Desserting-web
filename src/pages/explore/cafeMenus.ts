import type { StoreMenu } from '@/api/cafeBooking';

export const MENU_CATEGORIES = [
  { id: 'dessert', label: '디저트' },
  { id: 'drink', label: '음료' },
  { id: 'set', label: '세트' },
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number]['id'];
export type CafeMenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  image: string | null;
  soldOut: boolean;
};

export function toCafeMenu(menus: StoreMenu[]): CafeMenuItem[] {
  const categories = {
    DESSERT: 'dessert',
    DRINK: 'drink',
    SET: 'set',
  } as const;
  return menus.map((item) => ({
    id: String(item.menuId),
    name: item.name,
    price: item.price,
    category: categories[item.category],
    image: item.imageUrl,
    soldOut: item.soldOut,
  }));
}

export function formatMenuPrice(price: number) {
  return `₩ ${price.toLocaleString('ko-KR')}`;
}

export function getMenuQuantities(
  menu: CafeMenuItem[],
  saved?: Record<string, number>,
) {
  return Object.fromEntries(
    menu.map((item) => {
      const quantity = saved?.[item.id] ?? 0;
      return [
        item.id,
        !item.soldOut && Number.isSafeInteger(quantity) && quantity >= 0
          ? Math.min(20, quantity)
          : 0,
      ];
    }),
  );
}

export function getMenuTotals(
  menu: CafeMenuItem[],
  quantities: Record<string, number>,
) {
  return menu.reduce(
    (total, item) => ({
      count: total.count + (quantities[item.id] ?? 0),
      price: total.price + item.price * (quantities[item.id] ?? 0),
    }),
    { count: 0, price: 0 },
  );
}
