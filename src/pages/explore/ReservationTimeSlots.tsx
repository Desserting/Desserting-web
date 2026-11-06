import { useId } from 'react';
import { formatTimeOfDay } from '@/lib/datetime';

export default function ReservationTimeSlots({
  times,
  value,
  onValueChange,
  disabled = false,
}: {
  times: string[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) {
  const name = useId();
  const groups =
    times.length > 6
      ? [
          {
            label: '오전',
            times: times.filter((time) => Number(time.slice(0, 2)) < 12),
          },
          {
            label: '오후',
            times: times.filter((time) => Number(time.slice(0, 2)) >= 12),
          },
        ]
      : [{ label: '', times }];

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-3 text-lg leading-6 font-bold">시간</legend>
      <div className="space-y-4">
        {groups
          .filter((group) => group.times.length > 0)
          .map((group) => (
            <div key={group.label}>
              {group.label && (
                <p
                  aria-hidden="true"
                  className="text-my-muted mb-2 text-sm font-medium"
                >
                  {group.label}
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {group.times.map((time) => (
                  <label
                    key={time}
                    className="relative min-w-0 cursor-pointer has-disabled:cursor-default"
                  >
                    <input
                      type="radio"
                      name={name}
                      value={time}
                      checked={value === time}
                      onChange={() => onValueChange(time)}
                      className="peer sr-only"
                    />
                    <span className="border-hairline bg-cafe-field text-ink peer-checked:border-mint-deep peer-checked:bg-mint-100 peer-checked:text-mint-deep peer-focus-visible:outline-mint-deep flex min-h-11 items-center justify-center rounded-xl border px-1 py-2 text-sm peer-checked:font-bold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                      {formatTimeOfDay(time)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
      </div>
    </fieldset>
  );
}
