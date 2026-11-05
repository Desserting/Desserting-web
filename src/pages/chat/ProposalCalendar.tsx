import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/** 오늘 0시. 시간을 뺀 날짜끼리 비교할 때 쓴다 */
function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * 약속 날짜를 고르는 작은 달력. 오늘 이전 날짜는 고를 수 없다.
 * 예약 화면의 달력과 같은 모양이지만, 시트 안에 들어가도록 줄여 썼다.
 */
export default function ProposalCalendar({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
}) {
  const today = startOfToday();
  const [month, setMonth] = useState(
    () =>
      new Date((value ?? today).getFullYear(), (value ?? today).getMonth(), 1),
  );
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cellCount = Math.ceil((month.getDay() + daysInMonth) / 7) * 7;
  // 이번 달보다 앞으로는 넘어가지 않는다
  const isCurrentMonth =
    year === today.getFullYear() && monthIndex === today.getMonth();

  const changeMonth = (offset: number) =>
    setMonth(new Date(year, monthIndex + offset, 1));

  return (
    <section aria-label="약속 날짜 선택">
      <div className="flex h-9 items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          disabled={isCurrentMonth}
          onClick={() => changeMonth(-1)}
          className="focus-visible:outline-mint-deep flex size-9 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 disabled:cursor-default disabled:opacity-30"
        >
          <ChevronLeft aria-hidden className="size-6" strokeWidth={2.2} />
        </button>
        <h3 aria-live="polite" className="text-[18px] leading-7 font-bold">
          {year}년 {monthIndex + 1}월
        </h3>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() => changeMonth(1)}
          className="focus-visible:outline-mint-deep flex size-9 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2"
        >
          <ChevronRight aria-hidden className="size-6" strokeWidth={2.2} />
        </button>
      </div>

      <div
        aria-hidden
        className="text-ink-muted mt-1 grid grid-cols-7 text-center text-[13px] leading-7 font-bold"
      >
        {WEEKDAYS.map((day, index) => (
          <span key={day} className={cn(index === 0 && 'text-destructive/70')}>
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: cellCount }, (_, index) => {
          const day = index - month.getDay() + 1;
          if (day < 1 || day > daysInMonth) {
            return <span key={index} aria-hidden className="h-9" />;
          }
          const cell = new Date(year, monthIndex, day);
          const past = cell.getTime() < today.getTime();
          const selected = value?.getTime() === cell.getTime();
          const isToday = cell.getTime() === today.getTime();

          return (
            <button
              key={index}
              type="button"
              disabled={past}
              aria-label={`${dateFormatter.format(cell)} ${WEEKDAYS[index % 7]}요일`}
              aria-pressed={selected}
              aria-current={isToday ? 'date' : undefined}
              onClick={() => onChange(cell)}
              className="focus-visible:outline-mint-deep flex h-9 cursor-pointer items-center justify-center rounded-full text-[15px] leading-6 focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:cursor-default"
            >
              <span
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-full border',
                  past && 'text-ink-muted/40 border-transparent',
                  !past &&
                    (selected
                      ? 'border-mint bg-mint font-bold'
                      : isToday
                        ? 'border-mint-deep font-bold'
                        : 'hover:bg-mint-50 border-transparent'),
                )}
              >
                {day}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
