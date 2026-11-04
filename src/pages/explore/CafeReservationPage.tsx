import { useState, type FormEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import CafeNotFound from './CafeNotFound';
import CafePageHeader from './CafePageHeader';
import { findCafe } from './cafes';
import ReservationTimePicker from './ReservationTimePicker';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
// Preview values from Figma, not live availability or a reservation policy.
const PREVIEW = {
  time: '16:00',
  guests: '2',
  guestCounts: [1, 2, 3, 4, 5, 6],
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
  const from = (location.state as { from?: string } | null)?.from;
  const backState =
    from?.startsWith('/') && !from.startsWith('//') ? { from } : undefined;
  const [date, setDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [month, setMonth] = useState(
    () => new Date(date.getFullYear(), date.getMonth(), 1),
  );
  const today = new Date().toDateString();
  const [time, setTime] = useState(PREVIEW.time);
  const [guests, setGuests] = useState(PREVIEW.guests);
  const [showNotice, setShowNotice] = useState(false);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cellCount = Math.ceil((month.getDay() + daysInMonth) / 7) * 7;

  if (!cafe) return <CafeNotFound />;

  const changeMonth = (offset: number) =>
    setMonth(new Date(year, monthIndex + offset, 1));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowNotice(true);
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
          <div className="mt-6 flex h-11 items-center justify-between">
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => changeMonth(-1)}
              className="focus-visible:outline-mint-deep flex size-11 cursor-pointer items-center rounded-full pl-[6px] text-[28px] leading-none focus-visible:outline-2"
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
              className="grid h-[45px] grid-cols-7 items-center text-center text-[15px] leading-6 font-bold"
              aria-hidden="true"
            >
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
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
                    className="focus-visible:outline-mint-deep flex h-[45px] cursor-pointer items-center justify-center rounded-full text-[15px] leading-6 focus-visible:outline-2 focus-visible:-outline-offset-2"
                  >
                    <span
                      className={cn(
                        'inline-flex aspect-square w-full max-w-10 items-center justify-center rounded-full border',
                        selected
                          ? 'border-mint bg-mint font-bold'
                          : isToday
                            ? 'border-mint-deep font-bold'
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

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex min-w-0 flex-col gap-2">
            <label
              id="reservation-time-label"
              htmlFor="reservation-time"
              className="text-base leading-6 font-bold"
            >
              시간
            </label>
            <ReservationTimePicker value={time} onValueChange={setTime} />
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <label
              id="guest-count-label"
              htmlFor="guest-count"
              className="text-base leading-6 font-bold"
            >
              인원
            </label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger
                id="guest-count"
                aria-labelledby="guest-count-label"
                className="bg-cafe-field h-11 rounded-[10px] border-0 px-3 text-base"
              >
                <SelectValue />
                <ChevronDown
                  aria-hidden="true"
                  className="text-ink-muted size-4 shrink-0"
                  strokeWidth={1.8}
                />
              </SelectTrigger>
              <SelectContent>
                {PREVIEW.guestCounts.map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count}명
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

      <Dialog open={showNotice} onOpenChange={setShowNotice}>
        <DialogContent className="max-w-[345px]">
          <DialogTitle>예약 안내</DialogTitle>
          <DialogDescription>
            {cafe.name}
            <br />
            {dateFormatter.format(date)} {time} · {guests}명<br />
            예약 기능은 준비 중이에요. 아직 예약이 접수되지 않았습니다.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="brand">확인</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </main>
  );
}
