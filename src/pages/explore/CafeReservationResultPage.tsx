import { useRef, useState } from 'react';
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
} from '@/api/cafeBooking';
import { chatKeys, shareCafeReservation, type ChatMessage } from '@/api/chat';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { getApiError } from '@/lib/axios';
import { formatTimeOfDay } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import CafeRequestState from './CafeRequestState';
import OrderReceipt from './OrderReceipt';
import { useReservationUpdates } from './useReservationUpdates';
import { useBookingFlow } from '@/lib/bookingFlow';
import type { CafeNavigationState } from './cafeNavigation';

const ACTION_BUTTON_CLASS = 'cursor-pointer rounded-[13px] pb-0 text-base';

function reservationDay(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return `${value.replaceAll('-', '.')} (${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`;
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
  const reservationNotice = useReservationUpdates(storeId ? reservationId : 0);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [leaveOpen, setLeaveOpen] = useState(false);
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
  const cancelled =
    receipt.data?.orderStatus === 'REFUNDED' ||
    reservation.data?.status === 'CANCELLED';
  const backToChat = () => navigate(chatPath, { replace: true });
  const confirmLeave = () => {
    if (sharing.current || share.isPending) return;
    if (shared || cancelled || !roomId) {
      backToChat();
      return;
    }
    setLeaveOpen(true);
  };
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
  if (view === 'complete' && cancelled)
    return <Navigate to={orderPath} state={backState} replace />;

  return (
    <main
      className={cn(
        'text-ink flex min-h-dvh flex-col px-6 pb-[max(47px,env(safe-area-inset-bottom,0px))]',
        view === 'order' ? 'bg-receipt-bg' : 'bg-white',
      )}
    >
      <PageHeader
        title={title}
        backTo={chatPath}
        onBack={view === 'order' ? confirmLeave : undefined}
      />
      {reservationNotice && (
        <p
          role="status"
          className="bg-mint-100 text-mint-deep mt-3 rounded-xl px-4 py-3 text-sm"
        >
          {reservationNotice}
        </p>
      )}
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
              className={ACTION_BUTTON_CLASS}
            >
              <Link to={orderPath} state={backState}>
                예약/주문 내역 보기
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <OrderReceipt order={order} />
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
              className={cn(ACTION_BUTTON_CLASS, 'h-[60px] rounded-[15px]')}
            >
              {share.isPending
                ? '공유 중…'
                : cancelled || shared || uncertainShare || !roomId
                  ? '채팅방으로 돌아가기'
                  : '예약/결제 내역 채팅방에 공유하기'}
            </Button>
          </div>
        </>
      )}
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogTitle>채팅방으로 돌아가기</DialogTitle>
          <DialogDescription>
            예약/결제 내역을 공유하지 않고 채팅방으로 돌아가시겠습니까?
          </DialogDescription>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11"
              >
                아니요
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="brand"
              size="lg"
              className="h-11"
              onClick={() => {
                setLeaveOpen(false);
                backToChat();
              }}
            >
              예
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
