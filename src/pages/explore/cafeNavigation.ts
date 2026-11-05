import type { MenuCategory } from './cafeMenus';

export type CafeNavigationState = {
  from?: string;
  /** 채팅에서 예약을 시작한 경우 돌아갈 채팅방 경로 */
  bookingFrom?: string;
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

export function getBookingFrom(state: CafeNavigationState | null) {
  const path = state?.bookingFrom;
  return typeof path === 'string' && /^\/chat\/[1-9]\d*$/.test(path)
    ? path
    : undefined;
}
