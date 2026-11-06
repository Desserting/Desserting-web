import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Navigate,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  cafeKeys,
  fetchCafeDetail,
  fetchCafeReservation,
  previewCafeOrder,
  placeCafeOrder,
  positiveId,
} from '@/api/cafeBooking';
import { Button } from '@/components/ui/button';
import { getApiError } from '@/lib/axios';
import CafeNotFound from './CafeNotFound';
import PageHeader from '@/components/PageHeader';
import CafeRequestState from './CafeRequestState';
import { formatMenuPrice, toCafeMenu, getMenuQuantities } from './cafeMenus';
import type { CafeNavigationState } from './cafeNavigation';

const PAYMENT_METHODS = [
  { id: 'card', label: '카드 결제 (모의)' },
  { id: 'simple', label: '간편 결제 (모의)' },
] as const;

export default function CafePaymentPage() {
  const { cafeId } = useParams();
  const storeId = positiveId(cafeId);
  const location = useLocation();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const state = location.state as CafeNavigationState | null;
  const reservationId = positiveId(
    params.get('reservationId') ?? state?.reservationId,
  );
  const detail = useQuery({
    queryKey: cafeKeys.detail(storeId),
    queryFn: () => fetchCafeDetail(storeId),
    enabled: !!storeId,
  });
  const reservation = useQuery({
    queryKey: cafeKeys.reservation(reservationId),
    queryFn: () => fetchCafeReservation(reservationId),
    enabled: !!reservationId,
  });
  const menu = toCafeMenu(detail.data?.menus ?? []);
  const quantities = getMenuQuantities(menu, state?.order?.quantities);
  const items = menu
    .filter((item) => quantities[item.id] > 0)
    .map((item) => ({
      menuId: Number(item.id),
      quantity: quantities[item.id],
    }));
  const matchingReservation = reservation.data?.storeId === storeId;
  const blocked =
    reservation.data?.status === 'CANCELLED' ||
    reservation.data?.status === 'COMPLETED';
  const preview = useQuery({
    queryKey: ['cafes', 'preview', reservationId, items],
    queryFn: () => previewCafeOrder(reservationId, items),
    enabled:
      detail.isSuccess &&
      matchingReservation &&
      !blocked &&
      items.length > 0 &&
      items.length <= 20,
    retry: false,
  });
  const [method, setMethod] = useState<'card' | 'simple'>(
    state?.paymentMethod ?? 'card',
  );
  const submitting = useRef(false);
  const payment = useMutation({
    mutationFn: () =>
      placeCafeOrder(reservationId, {
        items,
        paymentType: 'COMBINED',
        paymentMethod: method === 'card' ? 'CARD' : 'EASY_PAY',
      }),
    retry: false,
    onSuccess: (order) => {
      queryClient.setQueryData(cafeKeys.receipt(reservationId), order);
      void queryClient.invalidateQueries({ queryKey: cafeKeys.orders });
      void queryClient.invalidateQueries({ queryKey: cafeKeys.reservations });
      void queryClient.invalidateQueries({
        queryKey: cafeKeys.reservation(reservationId),
      });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: cafeKeys.orders });
      void queryClient.invalidateQueries({ queryKey: cafeKeys.reservations });
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  const backState = { ...state, reservationId } satisfies CafeNavigationState;
  const menuPath = `/explore/cafes/${storeId}/menu?reservationId=${reservationId}`;

  if (payment.isSuccess) {
    return (
      <Navigate
        to={`/explore/cafes/${storeId}/reservations/${reservationId}/complete`}
        replace
      />
    );
  }

  if (!storeId) return <CafeNotFound />;
  if (!reservationId)
    return (
      <Navigate
        to={`/explore/cafes/${storeId}/reservation`}
        state={backState}
        replace
      />
    );
  if (
    detail.isPending ||
    detail.isError ||
    reservation.isPending ||
    reservation.isError
  )
    return (
      <main className="min-h-dvh px-6">
        <PageHeader title="결제하기" backTo={menuPath} backState={backState} />
        <CafeRequestState
          pending={detail.isPending || reservation.isPending}
          error={detail.error ?? reservation.error}
          onRetry={() => {
            void detail.refetch();
            void reservation.refetch();
          }}
        />
      </main>
    );
  if (!matchingReservation) return <CafeNotFound />;
  if (!state?.order || items.length === 0)
    return <Navigate to={menuPath} state={backState} replace />;

  const submit = () => {
    if (
      !preview.isSuccess ||
      preview.isFetching ||
      blocked ||
      submitting.current ||
      payment.isSuccess
    )
      return;
    submitting.current = true;
    payment.mutate();
  };
  const price = (amount: number | undefined) =>
    amount === undefined ? '—' : formatMenuPrice(amount);

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <PageHeader title="결제하기" backTo={menuPath} backState={backState} />
      {blocked ? (
        <p role="alert" className="text-destructive mt-8">
          취소되었거나 완료된 예약은 결제할 수 없어요.
        </p>
      ) : (
        (preview.isPending || preview.isError) && (
          <CafeRequestState
            pending={preview.isPending}
            error={preview.error}
            onRetry={() => void preview.refetch()}
          />
        )
      )}
      <dl className="mt-[46px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[17px] leading-[27px] font-bold">주문 금액</dt>
          <dd className="text-lg font-bold tabular-nums">
            {price(preview.data?.totalAmount)}
          </dd>
        </div>
        <div className="mt-[41px] flex items-center justify-between gap-3">
          <dt className="text-[17px] leading-[27px] font-bold">할인 금액</dt>
          <dd className="text-lg font-bold tabular-nums">
            {preview.data
              ? `− ${formatMenuPrice(preview.data.discountAmount)}`
              : '—'}
          </dd>
        </div>
        {preview.data?.couponName && (
          <p className="text-mint-deep mt-2 text-sm">
            {preview.data.couponName}
          </p>
        )}
        <div className="border-cafe-payment-divider mt-[35px] flex items-center justify-between gap-3 border-t pt-6">
          <dt className="text-[21px] leading-8 font-bold">총 결제 금액</dt>
          <dd className="text-[23px] leading-[35px] font-bold tabular-nums">
            {price(preview.data?.finalAmount)}
          </dd>
        </div>
      </dl>
      <fieldset
        disabled={payment.isPending || payment.isSuccess}
        className="mt-[60px] flex flex-col gap-[19px]"
      >
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
            <span className="border-cafe-payment-border peer-checked:border-mint peer-checked:bg-cafe-payment-selected peer-focus-visible:outline-mint-deep flex min-h-[58px] items-center rounded-xl border bg-white px-4 text-[17px] leading-6 font-bold peer-focus-visible:outline-2">
              {paymentMethod.label}
            </span>
          </label>
        ))}
      </fieldset>
      <p className="text-my-muted mt-4 text-center text-xs">
        모의 결제로 실제 금액은 청구되지 않아요.
      </p>
      {payment.isError && (
        <div role="alert" className="text-destructive mt-4 text-sm">
          <p>
            {getApiError(payment.error)?.message ??
              '결제 결과를 확인하지 못했어요. 중복 결제를 피하도록 다시 결제하지 말고 매장에 확인해 주세요.'}
          </p>
        </div>
      )}
      <div className="mt-auto pt-8">
        <Button
          type="button"
          variant="brand"
          size="xl"
          onClick={submit}
          disabled={
            blocked ||
            !preview.isSuccess ||
            preview.isFetching ||
            payment.isPending ||
            payment.isSuccess ||
            (payment.isError && !getApiError(payment.error))
          }
          className="cursor-pointer rounded-[13px] pb-0 text-lg"
        >
          {payment.isPending ? '결제 중…' : '결제하기'}
        </Button>
      </div>
    </main>
  );
}
