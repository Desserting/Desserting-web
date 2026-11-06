import type { MenuCategory } from './cafeMenus';

export type CafeNavigationState = {
  from?: string;
  reservationId?: number;
  reservation?: {
    date: number;
    time: string;
    guests: string;
  };
  order?: {
    quantities: Record<string, number>;
    category: MenuCategory;
  };
  paymentMethod?: 'card' | 'simple';
};
