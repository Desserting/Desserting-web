import { createContext, useContext } from 'react';

export type BookingFlow = {
  /** 채팅에서 시작한 예약 흐름 안에 있을 때만 채팅방 경로가 있다 */
  bookingFrom?: string;
  startBooking: (chatPath: string) => void;
  /** 출발한 채팅방으로 되돌아간다 */
  exitBooking: () => void;
};

export const BookingFlowContext = createContext<BookingFlow | null>(null);

/** 예약 흐름은 탐색 하위 경로 안에서만 이어진다 */
export const isExplorePath = (pathname: string) =>
  /^\/explore(\/|$)/.test(pathname);

export function useBookingFlow() {
  const value = useContext(BookingFlowContext);
  if (!value)
    throw new Error(
      'useBookingFlow는 BookingFlowProvider 안에서만 쓸 수 있어요',
    );
  return value;
}
