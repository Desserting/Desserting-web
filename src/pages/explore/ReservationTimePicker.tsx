import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import TimeWheelColumn from './TimeWheelColumn';

const PERIODS = [
  { value: 'am', label: '오전' },
  { value: 'pm', label: '오후' },
];
const HOURS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));
const MINUTES = Array.from({ length: 60 }, (_, index) => ({
  value: String(index).padStart(2, '0'),
  label: String(index).padStart(2, '0'),
}));

function toParts(value: string) {
  const [hour, minute] = value.split(':');
  return {
    period: Number(hour) < 12 ? 'am' : 'pm',
    hour: String(Number(hour) % 12 || 12),
    minute,
  };
}

function formatTime(value: string) {
  const { period, hour, minute } = toParts(value);
  return `${period === 'am' ? '오전' : '오후'} ${hour}:${minute}`;
}

export default function ReservationTimePicker({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => toParts(value));
  const draftHour =
    (Number(draft.hour) % 12) + (draft.period === 'pm' ? 12 : 0);
  const draftValue = `${String(draftHour).padStart(2, '0')}:${draft.minute}`;

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setDraft(toParts(value));
        setOpen(nextOpen);
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          id="reservation-time"
          aria-labelledby="reservation-time-label reservation-time-value"
          className="bg-cafe-field focus-visible:ring-ring/50 flex h-11 w-full cursor-pointer items-center justify-between rounded-[10px] px-3 text-base outline-none focus-visible:ring-3"
        >
          <span id="reservation-time-value">{formatTime(value)}</span>
          <ChevronDown
            aria-hidden="true"
            className="text-ink-muted size-4 shrink-0"
            strokeWidth={1.8}
          />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="text-ink mx-auto max-h-[90dvh] max-w-[390px] gap-4 overflow-y-auto rounded-t-3xl px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom,0px))]"
      >
        <div
          aria-hidden="true"
          className="bg-line mx-auto h-1 w-10 shrink-0 rounded-full"
        />
        <div className="space-y-2">
          <SheetTitle className="text-lg font-bold">시간 선택</SheetTitle>
        </div>
        <div className="grid grid-cols-3 gap-2 px-2">
          <fieldset className="flex h-[132px] min-w-0 flex-col justify-center gap-2 pr-2">
            <legend className="sr-only">오전·오후</legend>
            {PERIODS.map((period) => (
              <label key={period.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="time-period"
                  value={period.value}
                  checked={draft.period === period.value}
                  onChange={() =>
                    setDraft((current) => ({
                      ...current,
                      period: period.value,
                    }))
                  }
                  className="peer sr-only"
                />
                <span className="bg-cafe-field text-ink-muted peer-checked:bg-mint peer-checked:text-ink peer-focus-visible:outline-mint-deep flex h-11 items-center justify-center rounded-xl text-base font-medium peer-checked:font-bold peer-focus-visible:outline-2">
                  {period.label}
                </span>
              </label>
            ))}
          </fieldset>
          <div className="relative col-span-2 grid grid-cols-2 gap-2">
            <div
              aria-hidden="true"
              className="bg-cafe-field pointer-events-none absolute inset-x-0 top-11 h-11 rounded-xl"
            />
            <TimeWheelColumn
              label="시"
              options={HOURS}
              value={draft.hour}
              startValue={1}
              onValueChange={(hour) =>
                setDraft((current) => ({ ...current, hour }))
              }
            />
            <TimeWheelColumn
              label="분"
              loop
              options={MINUTES}
              value={draft.minute}
              onValueChange={(minute) =>
                setDraft((current) => ({ ...current, minute }))
              }
            />
          </div>
        </div>
        <Button
          type="button"
          variant="brand"
          size="xl"
          className="h-11 cursor-pointer pb-0 text-base"
          onClick={() => {
            onValueChange(draftValue);
            setOpen(false);
          }}
        >
          선택 완료
        </Button>
      </SheetContent>
    </Sheet>
  );
}
