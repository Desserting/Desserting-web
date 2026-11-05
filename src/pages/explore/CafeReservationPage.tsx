import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTimeOfDay } from '@/lib/datetime';
import CafeNotFound from './CafeNotFound';
import CafePageHeader from './CafePageHeader';
import { findCafe } from './cafes';
import ReservationTimePicker from './ReservationTimePicker';
import { getBookingFrom, type CafeNavigationState } from './cafeNavigation';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
// Preview values from Figma, not live availability or a reservation policy.
const PREVIEW = {
  time: '16:00',
  guests: '2',
};
const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export default function CafeReservationPage() {
  const { cafeId } = useParams();
  const cafe = findCafe(cafeId);
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = location.state as CafeNavigationState | null;
  const from = navigationState?.from;
  const savedReservation = navigationState?.reservation;
  const backState = {
    ...(from?.startsWith('/') && !from.startsWith('//') ? { from } : {}),
    bookingFrom: getBookingFrom(navigationState),
  };
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [date, setDate] = useState(() => {
    if (savedReservation) {
      const savedDate = new Date(savedReservation.date);
      if (savedDate >= currentMonth) return savedDate;
    }
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [month, setMonth] = useState(
    () => new Date(date.getFullYear(), date.getMonth(), 1),
  );
  const today = now.toDateString();
  const canGoToPreviousMonth = month > currentMonth;
  const [time, setTime] = useState(savedReservation?.time ?? PREVIEW.time);
  const guests = savedReservation?.guests ?? PREVIEW.guests;
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cellCount = Math.ceil((month.getDay() + daysInMonth) / 7) * 7;

  if (!cafe) return <CafeNotFound />;

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(year, monthIndex + offset, 1);
    if (nextMonth >= currentMonth) setMonth(nextMonth);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const state = {
      ...backState,
      ...(navigationState?.order ? { order: navigationState.order } : {}),
      reservation: { date: date.getTime(), time, guests },
    } satisfies CafeNavigationState;
    navigate(location.pathname, { replace: true, state });
    navigate(`/explore/cafes/${cafe.id}/menu`, { state });
  };

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pt-[clamp(32px,8dvh,68px)] pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <CafePageHeader
        title="예약하기"
        backTo={`/explore/cafes/${cafe.id}`}
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
                const day = index - month.getDay() + 1;
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
                    onClick={() => setDate(value)}
                    className={cn(
                      'focus-visible:outline-mint-deep flex h-[45px] cursor-pointer items-center justify-center rounded-full text-[15px] leading-6 focus-visible:outline-2 focus-visible:-outline-offset-2',
                      index % 7 === 0 && 'text-cafe-calendar-sunday',
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
              <ReservationTimePicker value={time} onValueChange={setTime} />
            </div>
          </div>
          <p
            aria-live="polite"
            aria-atomic="true"
            className="mt-2 text-center text-sm leading-6 font-bold"
          >
            {date.getMonth() + 1}월 {date.getDate()}일 {WEEKDAYS[date.getDay()]}
            요일 · {formatTimeOfDay(time)}
          </p>
        </div>

        <div className="mt-auto pt-8">
          <Button
            type="submit"
            variant="brand"
            size="xl"
            className="cursor-pointer rounded-[13px] pb-0 text-lg"
          >
            예약하기
          </Button>
        </div>
      </form>
    </main>
  );
}
