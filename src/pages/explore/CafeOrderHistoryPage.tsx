import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CafePageHeader from './CafePageHeader';
import { findCafe } from './cafes';
import { PREVIEW_CAFE_ORDER } from './cafeOrders';
import type { CafeNavigationState } from './cafeNavigation';

export default function CafeOrderHistoryPage() {
  const {
    cafeId = PREVIEW_CAFE_ORDER.cafeId,
    orderId = PREVIEW_CAFE_ORDER.id,
  } = useParams();
  const cafe = findCafe(cafeId);
  const navigationState = useLocation().state as CafeNavigationState | null;
  const from = navigationState?.from;
  const backState = {
    bookingFrom: navigationState?.bookingFrom,
    ...(from?.startsWith('/') && !from.startsWith('//') ? { from } : {}),
    ...(navigationState?.reservation
      ? { reservation: navigationState.reservation }
      : {}),
    ...(navigationState?.order ? { order: navigationState.order } : {}),
    ...(navigationState?.paymentMethod
      ? { paymentMethod: navigationState.paymentMethod }
      : {}),
  } satisfies CafeNavigationState;

  if (
    !cafe ||
    cafeId !== PREVIEW_CAFE_ORDER.cafeId ||
    orderId !== PREVIEW_CAFE_ORDER.id
  ) {
    return (
      <main className="text-ink flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <h1 className="text-[23px] font-bold">주문 내역을 찾을 수 없어요</h1>
        <p>주문 주소를 다시 확인해 주세요.</p>
        <Button asChild variant="brand">
          <Link to="/my">마이페이지로 돌아가기</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pt-[clamp(32px,8dvh,68px)] pb-[max(59px,env(safe-area-inset-bottom,0px))]">
      <CafePageHeader
        title="주문 내역"
        backTo={
          navigationState?.order ? `/explore/cafes/${cafe.id}/payment` : '/my'
        }
        backState={backState}
      />

      <section
        aria-labelledby="order-cafe-name"
        className="border-cafe-order-border mt-9 flex min-h-[455px] flex-col rounded-[17px] border px-[17px] pt-[19px] pb-[22px]"
      >
        <h2
          id="order-cafe-name"
          className="text-center text-2xl leading-9 font-bold"
        >
          {cafe.name}
        </h2>
        <dl className="mt-6 flex items-center justify-between gap-3 leading-[26px]">
          <dt className="text-base">주문 번호</dt>
          <dd className="text-[17px] font-bold">#{orderId}</dd>
        </dl>

        <ol
          aria-label="모의 주문 처리 상태"
          className="before:bg-cafe-order-line relative mt-[41px] flex flex-col gap-[58px] pl-[3px] before:absolute before:top-4 before:bottom-4 before:left-[18px] before:w-0.5"
        >
          {PREVIEW_CAFE_ORDER.steps.map((step, index) => (
            <li
              key={step.label}
              aria-current={
                index === PREVIEW_CAFE_ORDER.steps.length - 1
                  ? 'step'
                  : undefined
              }
              className="relative flex min-h-8 items-center gap-4"
            >
              <span
                aria-hidden="true"
                className="bg-mint flex size-8 shrink-0 items-center justify-center rounded-full text-[19px] leading-6 font-bold"
              >
                ✓
              </span>
              <span className="text-[19px] leading-7 font-bold">
                {step.label}
              </span>
              <time
                dateTime={step.time}
                className="ml-auto shrink-0 text-right text-[13px] leading-6"
              >
                {step.displayTime}
              </time>
            </li>
          ))}
        </ol>
        <p className="text-ink-muted mt-auto pt-6 text-center text-[11px] leading-[18px]">
          모의 주문 내역이며, 실제 주문은 접수되지 않았어요.
        </p>
      </section>

      <div className="mt-auto pt-8">
        <p className="bg-premium-price flex min-h-20 items-center justify-center rounded-[15px] px-3 py-6 text-center text-[17px] leading-[26px] font-bold">
          매장에서 메뉴를 수령해 주세요!
        </p>
      </div>
    </main>
  );
}
