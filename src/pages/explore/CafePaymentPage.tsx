import { useState } from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CafeNotFound from './CafeNotFound';
import CafePageHeader from './CafePageHeader';
import { findCafe } from './cafes';
import {
  formatMenuPrice,
  getCafeMenu,
  getMenuQuantities,
  getMenuTotals,
} from './cafeMenus';
import type { CafeNavigationState } from './cafeNavigation';
import { PREVIEW_CAFE_ORDER } from './cafeOrders';

const PAYMENT_METHODS = [
  { id: 'card', label: '카드 결제 (모의)' },
  { id: 'simple', label: '간편 결제 (모의)' },
] as const;
// Mock checkout rate from Figma; live pricing must come from the payment API.
const PARTNERSHIP_FEE_PERCENT = 7;

export default function CafePaymentPage() {
  const { cafeId } = useParams();
  const cafe = findCafe(cafeId);
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = location.state as CafeNavigationState | null;
  const menu = getCafeMenu(cafeId ?? '');
  const quantities = getMenuQuantities(
    menu,
    navigationState?.order?.quantities ?? {},
  );
  const totals = getMenuTotals(menu, quantities);
  const fee = Math.round((totals.price * PARTNERSHIP_FEE_PERCENT) / 100);
  const paymentTotal = totals.price + fee;
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]['id']>(
    navigationState?.paymentMethod ?? 'card',
  );
  const from = navigationState?.from;
  const backState = {
    bookingFrom: navigationState?.bookingFrom,
    ...(from?.startsWith('/') && !from.startsWith('//') ? { from } : {}),
    ...(navigationState?.reservation
      ? { reservation: navigationState.reservation }
      : {}),
    ...(navigationState?.order ? { order: navigationState.order } : {}),
  } satisfies CafeNavigationState;

  if (!cafe) return <CafeNotFound />;
  if (!navigationState?.order || totals.count === 0) {
    return (
      <Navigate
        to={`/explore/cafes/${cafe.id}/menu`}
        state={backState}
        replace
      />
    );
  }

  const completeMockPayment = () => {
    const state = {
      ...backState,
      paymentMethod: method,
    } satisfies CafeNavigationState;
    navigate(location.pathname, { replace: true, state });
    navigate(`/explore/cafes/${cafe.id}/orders/${PREVIEW_CAFE_ORDER.id}`, {
      state,
    });
  };

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pt-[clamp(32px,8dvh,68px)] pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <CafePageHeader
        title="결제하기"
        backTo={`/explore/cafes/${cafe.id}/menu`}
        backState={backState}
      />

      <dl className="mt-[46px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[17px] leading-[27px] font-bold">주문 금액</dt>
          <dd className="text-lg leading-[27px] font-bold tabular-nums">
            {formatMenuPrice(totals.price)}
          </dd>
        </div>
        <div className="mt-[41px] flex items-center justify-between gap-3">
          <dt className="text-[17px] leading-[27px] font-bold">
            제휴 수수료 ({PARTNERSHIP_FEE_PERCENT}%)
          </dt>
          <dd className="text-lg leading-[27px] font-bold tabular-nums">
            {formatMenuPrice(fee)}
          </dd>
        </div>
        <div className="border-cafe-payment-divider mt-[35px] flex items-center justify-between gap-3 border-t pt-6">
          <dt className="text-[21px] leading-8 font-bold">총 결제 금액</dt>
          <dd className="text-[23px] leading-[35px] font-bold tabular-nums">
            {formatMenuPrice(paymentTotal)}
          </dd>
        </div>
      </dl>

      <fieldset className="mt-[60px] flex flex-col gap-[19px]">
        <legend className="sr-only">결제 수단</legend>
        {PAYMENT_METHODS.map((paymentMethod) => (
          <label key={paymentMethod.id} className="relative cursor-pointer">
            <input
              type="radio"
              name="payment-method"
              value={paymentMethod.id}
              checked={method === paymentMethod.id}
              onChange={() => setMethod(paymentMethod.id)}
              className="peer sr-only"
            />
            <span className="border-cafe-payment-border peer-checked:border-mint peer-checked:bg-cafe-payment-selected peer-focus-visible:outline-mint-deep flex min-h-[58px] items-center gap-2 rounded-xl border bg-white px-4 text-[17px] leading-6 font-bold peer-focus-visible:outline-2">
              {paymentMethod.label}
            </span>
          </label>
        ))}
      </fieldset>

      <div className="mt-auto pt-8">
        <Button
          type="button"
          variant="brand"
          size="xl"
          className="cursor-pointer rounded-[13px] pb-0 text-lg"
          onClick={completeMockPayment}
        >
          결제하기
        </Button>
      </div>
    </main>
  );
}
