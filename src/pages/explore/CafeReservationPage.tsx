import { useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  cafeKeys,
  fetchCafeDetail,
  fetchReservationDates,
  fetchReservationSlots,
  createCafeReservation,
  fetchCafeReservation,
  positiveId,
} from '@/api/cafeBooking';
import { getApiError } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTimeOfDay, toDateKey } from '@/lib/datetime';
import CafeNotFound from './CafeNotFound';
import CafePageHeader from './CafePageHeader';
import CafeRequestState from './CafeRequestState';
import ReservationTimePicker from './ReservationTimePicker';
import { getBookingFrom, type CafeNavigationState } from './cafeNavigation';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export default function CafeReservationPage() {
  const { cafeId } = useParams();
  const storeId = positiveId(cafeId);
  const detail = useQuery({
    queryKey: cafeKeys.detail(storeId),
    queryFn: () => fetchCafeDetail(storeId),
    enabled: !!storeId,
  });
  const cafe = detail.data;
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = location.state as CafeNavigationState | null;
  const from = navigationState?.from;
  const savedReservation = navigationState?.reservation;
  const reservationId = positiveId(
    searchParams.get('reservationId') ?? navigationState?.reservationId,
  );
  const existing = useQuery({
    queryKey: cafeKeys.reservation(reservationId),
    queryFn: () => fetchCafeReservation(reservationId),
    enabled: !!reservationId,
  });
  const backState = {
    ...(from?.startsWith('/') && !from.startsWith('//') ? { from } : {}),
    bookingFrom: getBookingFrom(navigationState),
  };
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [pickedDate, setDate] = useState(() => {
    if (savedReservation) {
      const savedDate = new Date(savedReservation.date);
      if (savedDate >= currentMonth) return savedDate;
    }
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const date = existing.data
    ? new Date(`${existing.data.reservationDate}T00:00:00`)
    : pickedDate;
  const [month, setMonth] = useState(
    () => new Date(date.getFullYear(), date.getMonth(), 1),
  );
  const today = now.toDateString();
  const canGoToPreviousMonth = !reservationId && month > currentMonth;
  const [pickedTime, setTime] = useState(savedReservation?.time ?? '');
  const guests = '2';
  const shownMonth = existing.data
    ? new Date(date.getFullYear(), date.getMonth(), 1)
    : month;
  const year = shownMonth.getFullYear();
  const monthIndex = shownMonth.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cellCount = Math.ceil((shownMonth.getDay() + daysInMonth) / 7) * 7;
  const todayKey = toDateKey(now);
  const fromDate = [toDateKey(shownMonth), todayKey].sort()[1];
  const toDate = toDateKey(new Date(year, monthIndex + 1, 0));
  const dates = useQuery({
    queryKey: cafeKeys.dates(storeId, fromDate, toDate),
    queryFn: () => fetchReservationDates(storeId, fromDate, toDate),
    enabled: !!storeId && !reservationId,
  });
  const availableDates = new Set(
    dates.data?.filter((item) => item.available).map((item) => item.date),
  );
  const dateKey = toDateKey(date);
  const slots = useQuery({
    queryKey: cafeKeys.slots(storeId, dateKey),
    queryFn: () => fetchReservationSlots(storeId, dateKey),
    enabled: !!storeId && !reservationId && availableDates.has(dateKey),
  });
  const availableSlots = (
    availableDates.has(dateKey) ? (slots.data ?? []) : []
  ).filter(
    (slot) =>
      slot.isAvailable &&
      slot.currentReservedCount < slot.maxCapacity &&
      new Date(`${dateKey}T${slot.slotTime}:00+09:00`) > now,
  );
  const availableTimes = availableSlots.map((slot) => slot.slotTime).sort();
  const time = existing.data?.reservationTime.slice(0, 5) ?? pickedTime;
  const selectedSlot = availableSlots.find((slot) => slot.slotTime === time);
  const submitting = useRef(false);
  const goToMenu = (id: number, state: CafeNavigationState) => {
    navigate(`${location.pathname}?reservationId=${id}`, {
      replace: true,
      state,
    });
    navigate(`/explore/cafes/${storeId}/menu?reservationId=${id}`, { state });
  };
  const create = useMutation({
    mutationFn: createCafeReservation,
    retry: false,
    onSuccess: (reservation) => {
      queryClient.setQueryData(
        cafeKeys.reservation(reservation.reservationId),
        reservation,
      );
      void queryClient.invalidateQueries({ queryKey: cafeKeys.reservations });
      void queryClient.invalidateQueries({
        queryKey: ['cafes', 'slots', storeId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['cafes', 'dates', storeId],
      });
      goToMenu(reservation.reservationId, {
        ...backState,
        order: navigationState?.order,
        reservationId: reservation.reservationId,
        reservation: {
          date: date.getTime(),
          time: reservation.reservationTime.slice(0, 5),
          guests: String(reservation.guestCount),
        },
      });
    },
    onError: () => {
      void slots.refetch();
      void dates.refetch();
      void queryClient.invalidateQueries({ queryKey: cafeKeys.reservations });
    },
    onSettled: () => {
      submitting.current = false;
    },
  });

  if (!storeId) return <CafeNotFound />;
  if (
    detail.isPending ||
    detail.isError ||
    (reservationId && (existing.isPending || existing.isError))
  )
    return (
      <main className="min-h-dvh px-6 pt-16">
        <CafePageHeader
          title="예약하기"
          backTo={`/explore/cafes/${storeId}`}
          backState={backState}
        />
        <CafeRequestState
          pending={detail.isPending || (!!reservationId && existing.isPending)}
          error={detail.error ?? existing.error}
          onRetry={() => {
            void detail.refetch();
            if (reservationId) void existing.refetch();
          }}
        />
      </main>
    );
  if (!cafe || (existing.data && existing.data.storeId !== storeId))
    return <CafeNotFound />;

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(year, monthIndex + offset, 1);
    if (nextMonth >= currentMonth) setMonth(nextMonth);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reservationId && existing.data) {
      goToMenu(reservationId, {
        ...navigationState,
        ...backState,
        reservationId,
      });
      return;
    }
    if (!selectedSlot || submitting.current || create.isSuccess) return;
    submitting.current = true;
    const chatRoomId = positiveId(backState.bookingFrom?.split('/').pop());
    create.mutate({
      slotId: selectedSlot.slotId,
      guestCount: Number(guests),
      ...(chatRoomId ? { chatRoomId } : {}),
    });
  };

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pt-[clamp(32px,8dvh,68px)] pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <CafePageHeader
        title="예약하기"
        backTo={`/explore/cafes/${cafe.storeId}`}
        backState={backState}
      />

      <form onSubmit={submit} className="flex flex-1 flex-col">
        <section aria-label="예약 날짜 선택">
          <div className="mx-10 mt-6 flex h-11 items-center justify-between">
            <button
              type="button"
              aria-label="이전 달"
              disabled={!canGoToPreviousMonth}
              onClick={() => changeMonth(-1)}
              className="focus-visible:outline-mint-deep flex size-11 cursor-pointer items-center rounded-full pl-[6px] text-[28px] leading-none focus-visible:outline-2 disabled:cursor-default disabled:opacity-30"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <h2
              aria-live="polite"
              className="text-[22px] leading-[33px] font-bold"
            >
              {year}년 {monthIndex + 1}월
            </h2>
            <button
              type="button"
              aria-label="다음 달"
              disabled={!!reservationId}
              onClick={() => changeMonth(1)}
              className="focus-visible:outline-mint-deep flex size-11 cursor-pointer items-center justify-end rounded-full pr-5 text-[28px] leading-none focus-visible:outline-2"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="mt-[31px] min-h-[333px]">
            <div
              className="text-my-muted grid h-[45px] grid-cols-7 items-center text-center text-[15px] leading-6 font-bold"
              aria-hidden="true"
            >
              {WEEKDAYS.map((day, index) => (
                <span
                  key={day}
                  className={
                    index === 0 ? 'text-cafe-calendar-sunday' : undefined
                  }
                >
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-2.5 grid grid-cols-7 gap-y-2.5">
              {Array.from({ length: cellCount }, (_, index) => {
                const day = index - shownMonth.getDay() + 1;
                if (day < 1 || day > daysInMonth)
                  return (
                    <span key={index} aria-hidden="true" className="h-[45px]" />
                  );
                const value = new Date(year, monthIndex, day);
                const selected = date.getTime() === value.getTime();
                const isToday = value.toDateString() === today;
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={`${dateFormatter.format(value)} ${WEEKDAYS[index % 7]}요일`}
                    aria-pressed={selected}
                    aria-current={isToday ? 'date' : undefined}
                    disabled={
                      !!reservationId ||
                      create.isPending ||
                      !availableDates.has(toDateKey(value))
                    }
                    onClick={() => setDate(value)}
                    className={cn(
                      'focus-visible:outline-mint-deep flex h-[45px] cursor-pointer items-center justify-center rounded-full text-[15px] leading-6 focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:cursor-default',
                      index % 7 === 0 && 'text-cafe-calendar-sunday',
                      !reservationId &&
                        !availableDates.has(toDateKey(value)) &&
                        'opacity-30',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex aspect-square w-full max-w-10 items-center justify-center rounded-full border-[1.5px]',
                        selected
                          ? 'border-cafe-calendar-selected bg-cafe-calendar-selected text-ink font-bold'
                          : isToday
                            ? 'border-mint-deep'
                            : 'hover:bg-mint-50 border-transparent',
                      )}
                    >
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        {!reservationId && (dates.isPending || dates.isError) && (
          <CafeRequestState
            pending={dates.isPending}
            error={dates.error}
            onRetry={() => void dates.refetch()}
          />
        )}
        {!reservationId && dates.isSuccess && availableDates.size === 0 && (
          <p className="text-my-muted text-center text-sm">
            이번 달에는 예약 가능한 날짜가 없어요.
          </p>
        )}

        <div className="mt-3">
          <div className="mx-3 grid min-w-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-3">
            <label
              id="reservation-time-label"
              htmlFor="reservation-time"
              className="text-lg leading-6 font-bold"
            >
              시간
            </label>
            <div className="min-w-0">
              <ReservationTimePicker
                value={time}
                onValueChange={setTime}
                disabled={
                  !!reservationId || create.isPending || !slots.isSuccess
                }
              />
            </div>
          </div>
          <p
            aria-live="polite"
            aria-atomic="true"
            className="mt-2 text-center text-sm leading-6 font-bold"
          >
            {time
              ? `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일 · ${formatTimeOfDay(time)}`
              : '예약 가능한 날짜와 시간을 선택해 주세요.'}
          </p>
          {!reservationId &&
            availableDates.has(dateKey) &&
            (slots.isPending || slots.isError) && (
              <CafeRequestState
                pending={slots.isPending}
                error={slots.error}
                onRetry={() => void slots.refetch()}
              />
            )}
          {!reservationId && slots.isSuccess && availableTimes.length === 0 && (
            <p className="text-my-muted mt-2 text-center text-sm">
              선택한 날짜에는 예약 가능한 시간이 없어요.
            </p>
          )}
          {!reservationId &&
            time &&
            slots.isSuccess &&
            availableTimes.length > 0 &&
            !selectedSlot && (
              <p
                role="alert"
                className="text-destructive mt-2 text-center text-sm"
              >
                선택한 시간은 예약할 수 없어요. 예약 가능한 시간:{' '}
                {availableTimes.map(formatTimeOfDay).join(', ')}
              </p>
            )}
          {reservationId > 0 && (
            <p className="text-my-muted mt-2 text-center text-sm">
              이미 생성된 예약이에요. 선택한 날짜와 시간으로 메뉴 선택을 진행해
              주세요.
            </p>
          )}
          {create.isError && (
            <p role="alert" className="text-destructive mt-3 text-sm">
              {getApiError(create.error)?.message ??
                '예약 결과를 확인하지 못했어요. 중복 예약을 피하도록 다시 예약하지 말고 매장에 확인해 주세요.'}
            </p>
          )}
        </div>

        <div className="mt-auto pt-8">
          <Button
            type="submit"
            variant="brand"
            size="xl"
            disabled={
              create.isPending ||
              create.isSuccess ||
              (!reservationId &&
                (!selectedSlot || dates.isFetching || slots.isFetching))
            }
            className="cursor-pointer rounded-[13px] pb-0 text-lg"
          >
            {create.isPending
              ? '예약 중…'
              : reservationId
                ? '메뉴 선택'
                : '예약하기'}
          </Button>
        </div>
      </form>
    </main>
  );
}
