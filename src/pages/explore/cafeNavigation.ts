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

let bookingOriginIndex: number | undefined;

function currentHistoryIndex() {
  const index = (window.history.state as { idx?: unknown } | null)?.idx;
  return typeof index === 'number' ? index : undefined;
}

/** 채팅에서 예약을 시작하는 순간의 history 위치를 기억한다 */
export function rememberBookingOrigin() {
  bookingOriginIndex = currentHistoryIndex();
}

/**
 * 예약 흐름의 뒤로가기는 대부분 push라서 history가 한 줄이 아니다.
 * 출발한 채팅방 위치까지 한 번에 되돌아가고, 위치를 모르면(새로고침 등) null을 돌려준다.
 */
export function bookingOriginDelta() {
  const current = currentHistoryIndex();
  return bookingOriginIndex !== undefined &&
    current !== undefined &&
    current > bookingOriginIndex
    ? bookingOriginIndex - current
    : null;
}

export function getBookingFrom(state: CafeNavigationState | null) {
  const path = state?.bookingFrom;
  return typeof path === 'string' && /^\/chat\/[1-9]\d*$/.test(path)
    ? path
    : undefined;
}
