import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookingFlowContext, isExplorePath } from '@/lib/bookingFlow';

type Booking = {
  /** 예약을 시작한 채팅방 경로 */
  from: string;
  /** 시작 시점의 history 위치. 되돌아갈 거리를 계산하는 데 쓴다 */
  originIndex?: number;
};

const STORAGE_KEY = 'desserting:booking-flow';

function currentHistoryIndex() {
  const index = (window.history.state as { idx?: unknown } | null)?.idx;
  return typeof index === 'number' ? index : undefined;
}

function readBooking(): Booking | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const value = raw ? (JSON.parse(raw) as Partial<Booking>) : null;
    return typeof value?.from === 'string' &&
      /^\/chat\/[1-9]\d*$/.test(value.from)
      ? {
          from: value.from,
          originIndex:
            typeof value.originIndex === 'number'
              ? value.originIndex
              : undefined,
        }
      : null;
  } catch {
    return null;
  }
}

function writeBooking(booking: Booking | null) {
  try {
    if (booking) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소를 못 쓰는 환경에서는 새로고침 시 흐름이 풀릴 뿐이다
  }
}

/**
 * 채팅에서 시작한 카페 예약 흐름의 상태.
 * 화면마다 location.state로 넘기지 않아도, 흐름 안의 어느 화면에서든
 * 하단 네비를 숨기고 채팅방으로 돌아갈 수 있다.
 */
export function BookingFlowProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(() =>
    isExplorePath(pathname) ? readBooking() : null,
  );
  const [trackedPath, setTrackedPath] = useState(pathname);

  // 탐색 밖으로 나가면(채팅방 복귀 포함) 흐름이 끝난 것이다.
  // 시작 직후 채팅방에 머무는 렌더에서 지워지지 않도록 경로가 바뀔 때만 확인한다.
  if (trackedPath !== pathname) {
    setTrackedPath(pathname);
    if (!isExplorePath(pathname)) setBooking(null);
  }

  useEffect(() => writeBooking(booking), [booking]);

  const startBooking = useCallback(
    (chatPath: string) => {
      setBooking({ from: chatPath, originIndex: currentHistoryIndex() });
      navigate('/explore');
    },
    [navigate],
  );

  const exitBooking = useCallback(() => {
    if (!booking) return;
    // 흐름 안의 뒤로가기는 대부분 push라 history가 한 줄이 아니다.
    // 출발한 채팅방 위치까지 한 번에 되돌아가고, 위치를 모르면 채팅방으로 이동한다.
    const current = currentHistoryIndex();
    if (
      booking.originIndex !== undefined &&
      current !== undefined &&
      current > booking.originIndex
    )
      navigate(booking.originIndex - current);
    else navigate(booking.from);
  }, [booking, navigate]);

  const bookingFrom =
    booking && isExplorePath(pathname) ? booking.from : undefined;
  const value = useMemo(
    () => ({ bookingFrom, startBooking, exitBooking }),
    [bookingFrom, startBooking, exitBooking],
  );

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
    </BookingFlowContext.Provider>
  );
}
