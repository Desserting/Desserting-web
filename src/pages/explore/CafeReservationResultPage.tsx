import { useRef } from 'react';
import { Check } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  cafeKeys,
  fetchCafeOrder,
  fetchCafeReservation,
  positiveId,
  type CafeOrder,
} from '@/api/cafeBooking';
import { chatKeys, shareCafeReservation, type ChatMessage } from '@/api/chat';
import { Button } from '@/components/ui/button';
import { getApiError } from '@/lib/axios';
import { formatClock, formatTimeOfDay, parseServerDate } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import CafeRequestState from './CafeRequestState';
import { useBookingFlow } from '@/lib/bookingFlow';
import type { CafeNavigationState } from './cafeNavigation';

function reservationDay(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return `${value.replaceAll('-', '.')} (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`;
}

function OrderProgress({ order }: { order: CafeOrder }) {
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
      className="border-cafe-order-border mt-9 flex min-h-[455px] flex-col rounded-[17px] border px-[17px] pt-[19px] pb-[22px]"
    >
      <h2
        id="order-cafe-name"
        className="text-center text-2xl leading-9 font-bold"
      >
        {order.storeName}
      </h2>
      <dl className="mt-6 flex items-center justify-between gap-3 leading-[26px]">
        <dt className="text-base">주문 번호</dt>
        <dd className="text-[17px] font-bold">#{order.orderId}</dd>
      </dl>
      {refunded ? (
        <p
          role="status"
          className="text-my-muted my-auto py-12 text-center font-bold"
        >
          {order.orderStatusDescription || order.reservationStatusDescription}
        </p>
      ) : (
        <ol
          aria-label="주문 처리 상태"
          className="mt-[41px] flex flex-col gap-[58px] pl-[3px]"
        >
          {steps.map((step, index) => (
            <li
              key={step.label}
              aria-current={step.done ? 'step' : undefined}
              className="relative flex min-h-8 items-center gap-4"
            >
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-8 -bottom-[58px] left-[15px] w-0.5',
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
                  className="ml-auto shrink-0 text-right text-[11px] leading-[18px]"
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
    </section>
  );
}

export default function CafeReservationResultPage({
  view,
}: {
  view: 'complete' | 'order';
}) {
  const route = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const state = location.state as CafeNavigationState | null;
  const { bookingFrom } = useBookingFlow();
  const storeId = positiveId(route.cafeId);
  const reservationId = positiveId(
    route.reservationId ?? params.get('reservationId') ?? state?.reservationId,
  );
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const reservation = useQuery({
    queryKey: cafeKeys.reservation(reservationId),
    queryFn: () => fetchCafeReservation(reservationId),
    enabled: !!storeId && !!reservationId,
  });
  const receipt = useQuery({
    queryKey: cafeKeys.receipt(reservationId),
    queryFn: () => fetchCafeOrder(reservationId),
    enabled: !!storeId && !!reservationId,
    refetchInterval: (query) => {
      const order = query.state.data;
      return view === 'order' &&
        order?.orderStatus === 'PAID' &&
        order.reservationStatus !== 'CANCELLED' &&
        order.currentStep !== 'READY'
        ? 10000
        : false;
    },
  });
  const roomId =
    positiveId(reservation.data?.chatRoomId) ||
    positiveId(bookingFrom?.split('/').pop());
  const chatPath = roomId ? `/chat/${roomId}` : '/chat';
  const resultPath = `/explore/cafes/${storeId}/reservations/${reservationId}`;
  const orderPath = `${resultPath}/order`;
  const backState = { reservationId } satisfies CafeNavigationState;
  const shareKey = [
    'cafes',
    'shared-reservation',
    roomId,
    reservationId,
  ] as const;
  const sharing = useRef(false);
  const share = useMutation({
    mutationFn: () => shareCafeReservation(roomId, reservationId),
    retry: false,
    onSuccess: (message) => {
      queryClient.setQueryData(shareKey, message);
      void queryClient.invalidateQueries({
        queryKey: chatKeys.messages(roomId),
      });
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
      navigate(chatPath, { replace: true });
    },
    onSettled: () => {
      sharing.current = false;
    },
  });
  const shared = queryClient.getQueryData<ChatMessage>(shareKey);
  const uncertainShare = share.isError && !getApiError(share.error);
  const returnToChat = () => {
    if (sharing.current || share.isPending) return;
    if (shared || uncertainShare || !roomId) {
      navigate(chatPath, { replace: true });
      return;
    }
    sharing.current = true;
    share.mutate();
  };
  const title = view === 'complete' ? '예약 완료' : '예약/주문 내역';
  const order = receipt.data;
  const booking = reservation.data;

  if (
    !storeId ||
    !reservationId ||
    (order &&
      (order.storeId !== storeId ||
        order.reservationId !== reservationId ||
        (route.orderId && positiveId(route.orderId) !== order.orderId))) ||
    (booking && booking.storeId !== storeId)
  ) {
    return (
      <main className="text-ink flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-[23px] font-bold">예약 내역을 찾을 수 없어요</h1>
        <Button asChild variant="brand">
          <Link to="/chat">채팅 목록으로 돌아가기</Link>
        </Button>
      </main>
    );
  }
  if (!order || !booking || receipt.isError || reservation.isError) {
    return (
      <main className="text-ink min-h-dvh bg-white px-6">
        <PageHeader title={title} backTo={chatPath} />
        <CafeRequestState
          pending={receipt.isPending || reservation.isPending}
          error={receipt.error ?? reservation.error}
          onRetry={() => {
            void receipt.refetch();
            void reservation.refetch();
          }}
        />
      </main>
    );
  }
  const cancelled =
    order.orderStatus === 'REFUNDED' || booking.status === 'CANCELLED';
  if (view === 'complete' && cancelled)
    return <Navigate to={orderPath} state={backState} replace />;

  return (
    <main className="text-ink flex min-h-dvh flex-col bg-white px-6 pb-[max(47px,env(safe-area-inset-bottom,0px))]">
      <PageHeader
        title={title}
        backTo={
          view === 'order' && !cancelled ? `${resultPath}/complete` : chatPath
        }
        backState={backState}
      />
      {view === 'complete' ? (
        <>
          <section
            aria-labelledby="reservation-complete-title"
            className="pt-[62px] text-center"
          >
            <span
              aria-hidden
              className="bg-mint-deep mx-auto flex size-[82px] items-center justify-center rounded-full text-white"
            >
              <Check className="size-12" strokeWidth={2.2} />
            </span>
            <h2
              id="reservation-complete-title"
              className="mt-[30px] text-[22px] leading-[33px] font-bold"
            >
              예약이 완료되었습니다!
            </h2>
            <p className="text-my-muted mt-5 text-[13px] leading-5">
              {booking.storeName} 예약이 정상적으로 완료되었어요.
            </p>
          </section>
          <dl className="bg-mint-100 mt-[54px] grid grid-cols-[94px_minmax(0,1fr)] items-start gap-x-4 gap-y-6 rounded-[17px] px-5 py-6 text-sm leading-5">
            <dt className="text-my-muted text-xs">매장</dt>
            <dd className="font-bold">{booking.storeName}</dd>
            <dt className="text-my-muted text-xs">예약 날짜</dt>
            <dd className="font-bold">
              {reservationDay(booking.reservationDate)}
            </dd>
            <dt className="text-my-muted text-xs">예약 시간</dt>
            <dd className="font-bold">
              {formatTimeOfDay(booking.reservationTime.slice(0, 5))}
            </dd>
          </dl>
          <div className="mt-auto pt-8">
            <Button
              asChild
              variant="brand"
              size="xl"
              className="rounded-[13px] pb-0 text-base"
            >
              <Link to={orderPath} state={backState}>
                예약/주문 내역 보기
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <OrderProgress order={order} />
          <div className="mt-auto pt-8">
            {cancelled && (
              <p
                role="status"
                className="text-my-muted mb-4 text-center text-sm"
              >
                취소된 예약 또는 환불된 주문이에요.
              </p>
            )}
            {share.isError && (
              <p role="alert" className="text-destructive mt-3 text-sm">
                {getApiError(share.error)?.message ??
                  '공유 결과를 확인하지 못했어요. 중복 전송을 피하도록 채팅방에서 내역을 확인해 주세요.'}
              </p>
            )}
            <Button
              type="button"
              variant="brand"
              size="xl"
              disabled={share.isPending}
              onClick={
                cancelled
                  ? () => navigate(chatPath, { replace: true })
                  : returnToChat
              }
              className="h-auto min-h-20 cursor-pointer rounded-[15px] px-3 py-5 text-base leading-6 whitespace-normal"
            >
              {share.isPending
                ? '공유 중…'
                : cancelled || shared || uncertainShare || !roomId
                  ? '채팅방으로 돌아가기'
                  : '예약·결제 내역 공유하고 채팅방으로'}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
