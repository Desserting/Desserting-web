import { useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

type WheelOption = { value: string; label: string };
const ROW_HEIGHT = 44;

export default function TimeWheelColumn({
  label,
  options,
  value,
  onValueChange,
  startValue = 0,
  loop = false,
}: {
  label: string;
  options: readonly WheelOption[];
  value: string;
  onValueChange: (value: string) => void;
  startValue?: number;
  loop?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialValue = useRef(value);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const middleOffset = loop ? options.length * 3 : 0;
  const itemCount = options.length * (loop ? 7 : 1);

  useLayoutEffect(() => {
    const index = options.findIndex(
      (option) => option.value === initialValue.current,
    );
    if (scrollRef.current)
      scrollRef.current.scrollTop =
        (middleOffset + Math.max(0, index)) * ROW_HEIGHT;
  }, [options, middleOffset]);

  const choose = (index: number) => {
    const nextIndex = Math.max(0, Math.min(itemCount - 1, index));
    scrollRef.current?.scrollTo({
      top: nextIndex * ROW_HEIGHT,
      behavior: 'instant',
    });
    onValueChange(options[nextIndex % options.length].value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let nextIndex: number;
    switch (event.key) {
      case 'ArrowUp':
        nextIndex = selectedIndex - 1;
        break;
      case 'ArrowDown':
        nextIndex = selectedIndex + 1;
        break;
      case 'PageUp':
        nextIndex = selectedIndex - 5;
        break;
      case 'PageDown':
        nextIndex = selectedIndex + 5;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const visibleIndex = Math.round(
      (scrollRef.current?.scrollTop ?? 0) / ROW_HEIGHT,
    );
    const cycleOffset = loop
      ? Math.floor(visibleIndex / options.length) * options.length
      : 0;
    choose(cycleOffset + nextIndex);
  };

  return (
    <div
      ref={scrollRef}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={startValue}
      aria-valuemax={options.length - 1 + startValue}
      aria-valuenow={selectedIndex + startValue}
      aria-valuetext={options[selectedIndex]?.label}
      onKeyDown={onKeyDown}
      onScroll={(event) => {
        const index = Math.max(
          0,
          Math.min(
            itemCount - 1,
            Math.round(event.currentTarget.scrollTop / ROW_HEIGHT),
          ),
        );
        const option = options[index % options.length];
        if (option.value !== value) onValueChange(option.value);
      }}
      onScrollEnd={(event) => {
        if (!loop) return;
        const element = event.currentTarget;
        const index = Math.round(element.scrollTop / ROW_HEIGHT);
        const centeredIndex = middleOffset + (index % options.length);
        // Move to the identical middle copy without a visible jump or value change.
        if (index !== centeredIndex)
          element.scrollTop = centeredIndex * ROW_HEIGHT;
      }}
      className="focus-visible:outline-mint-deep h-[132px] min-w-0 snap-y snap-mandatory [scrollbar-width:none] overflow-y-auto overscroll-y-contain rounded-xl py-11 text-center outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 [&::-webkit-scrollbar]:hidden"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, black 33%, black 67%, transparent)',
      }}
    >
      <div aria-hidden="true">
        {Array.from({ length: itemCount }, (_, index) => {
          const option = options[index % options.length];
          return (
            <div
              key={index}
              onClick={() => choose(index)}
              className={cn(
                'flex h-11 cursor-pointer snap-center items-center justify-center text-[22px] leading-8 tabular-nums select-none',
                option.value === value
                  ? 'text-ink font-bold'
                  : 'text-ink-muted/45 font-medium',
              )}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
