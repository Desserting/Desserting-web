import cake from '@/assets/cafes/strawberry-cake.png';
import americano from '@/assets/cafes/americano.svg';

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
  image: string;
  imageType: 'photo' | 'illustration';
  initialQuantity: number;
};

// Figma preview values, not live menu availability or an existing order.
const CAFE_MENUS: Record<string, CafeMenuItem[]> = {
  olive: [
    {
      id: 'strawberry-cake',
      name: '딸기케이크',
      category: 'dessert',
      price: 7500,
      image: cake,
      imageType: 'photo',
      initialQuantity: 1,
    },
    {
      id: 'americano',
      name: '아메리카노',
      category: 'drink',
      price: 4500,
      image: americano,
      imageType: 'illustration',
      initialQuantity: 2,
    },
  ],
};

export function getCafeMenu(cafeId: string) {
  return CAFE_MENUS[cafeId] ?? [];
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
      const quantity = saved ? (saved[item.id] ?? 0) : item.initialQuantity;
      return [
        item.id,
        Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : 0,
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
