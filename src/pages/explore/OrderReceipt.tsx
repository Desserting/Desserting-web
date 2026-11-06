import { Check } from 'lucide-react';
import type { CafeOrder } from '@/api/cafeBooking';
import { formatClock, parseServerDate } from '@/lib/datetime';
import { cn } from '@/lib/utils';

const BARCODE_WIDTH = 210;
const BARCODE_HEIGHT = 40;

/**
 * 주문 번호로 만든 장식용 막대 무늬. 실제로 스캔되는 바코드가 아니다.
 * 같은 주문 번호는 항상 같은 모양이 나온다.
 */
function barcodeBars(seed: number) {
  let state = Math.imul(seed + 1, 2654435761) >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state >>> 16;
  };
  const bars: { x: number; width: number }[] = [];
  let x = 0;
  while (x < BARCODE_WIDTH) {
    const width = Math.min(1 + (next() % 3), BARCODE_WIDTH - x);
    bars.push({ x, width });
    x += width + 1 + (next() % 2);
  }
  return bars;
}

function Divider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('border-receipt-dash border-t border-dashed', className)}
    />
  );
}

export default function OrderReceipt({ order }: { order: CafeOrder }) {
  const refunded =
    order.orderStatus === 'REFUNDED' || order.reservationStatus === 'CANCELLED';
  const steps = [
    { label: '주문 접수', at: order.paidAt, done: true },
    {
      label: '주문 준비 예정',
      at: `${order.reservationDate}T${order.reservationTime.slice(0, 5)}:00`,
      done: false,
    },
  ];
  return (
    <section
      aria-labelledby="order-cafe-name"
      className="mt-5 drop-shadow-[0_4px_14px_rgb(0_0_0/0.07)]"
    >
      <div className="receipt-paper flex flex-col px-[26px] pt-[23px] pb-[27px]">
        <header className="text-center">
          <p
            aria-hidden
            className="text-ink-hint text-[11px] leading-4 font-medium tracking-[0.22em]"
          >
            RECEIPT
          </p>
          <h2
            id="order-cafe-name"
            className="mt-1.5 text-2xl leading-9 font-bold"
          >
            {order.storeName}
          </h2>
          <p className="text-ink-sub mt-px text-xs leading-[18px]">
            예약 · 주문 내역서
          </p>
        </header>
        <Divider className="mt-5" />
        <dl className="text-ink-body flex items-center justify-between gap-3 py-3.5 leading-[26px]">
          <dt className="text-[15px]">주문 번호</dt>
          <dd className="text-ink text-2xl font-bold">#{order.orderId}</dd>
        </dl>
        <Divider />
        {refunded ? (
          <p
            role="status"
            className="text-my-muted py-14 text-center leading-6 font-bold"
          >
            {order.orderStatusDescription || order.reservationStatusDescription}
          </p>
        ) : (
          <ol
            aria-label="주문 처리 상태"
            className="flex flex-col gap-[35px] py-[19px]"
          >
            {steps.map((step, index) => (
              <li
                key={step.label}
                aria-current={step.done ? 'step' : undefined}
                className="relative flex min-h-8 items-center gap-[15px]"
              >
                {index < steps.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-8 -bottom-[37px] left-[15px] w-0.5',
                      steps[index + 1].done ? 'bg-cafe-order-line' : 'bg-line',
                    )}
                  />
                )}
                <span
                  aria-hidden
                  className={cn(
                    'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                    step.done ? 'bg-mint' : 'bg-cafe-field text-my-muted',
                  )}
                >
                  {step.done ? (
                    <Check className="size-5" strokeWidth={2.2} />
                  ) : (
                    <span className="size-2 rounded-full bg-current" />
                  )}
                </span>
                <span
                  className={cn(
                    'text-[19px] leading-7 font-bold',
                    !step.done && 'text-my-muted',
                  )}
                >
                  {step.label}
                </span>
                {step.at ? (
                  <time
                    dateTime={step.at}
                    className={cn(
                      'ml-auto shrink-0 text-right text-[11px] leading-[18px]',
                      !step.done && 'text-ink-hint',
                    )}
                  >
                    {new Intl.DateTimeFormat('sv-SE')
                      .format(parseServerDate(step.at))
                      .replaceAll('-', '.')}
                    <br />
                    {formatClock(step.at)}
                  </time>
                ) : (
                  <span className="text-my-muted ml-auto text-[11px]">
                    {step.done ? '시각 미제공' : '대기 중'}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
        <Divider />
        <div className="flex flex-col items-center pt-[19px]">
          <svg
            aria-hidden
            width={BARCODE_WIDTH}
            height={BARCODE_HEIGHT}
            viewBox={`0 0 ${BARCODE_WIDTH} ${BARCODE_HEIGHT}`}
            className="fill-ink"
          >
            {barcodeBars(order.orderId).map((bar) => (
              <rect
                key={bar.x}
                x={bar.x}
                width={bar.width}
                height={BARCODE_HEIGHT}
              />
            ))}
          </svg>
          <p
            aria-hidden
            className="text-ink-hint mt-[7px] text-[11px] leading-4 tracking-[0.18em]"
          >
            NO. {String(order.orderId).padStart(4, '0')}
          </p>
          <p className="text-ink-body mt-2.5 text-xs leading-[18px] font-bold">
            이용해 주셔서 감사합니다
          </p>
        </div>
      </div>
    </section>
  );
}
