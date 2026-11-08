import { ReceiptText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cafeKeys, fetchCafeReservation } from '@/api/cafeBooking';
import { parseReservationCard, type ChatMessage } from '@/api/chat';
import { formatProposalDate } from '@/lib/datetime';

export default function ReservationMessageCard({
  message,
}: {
  message: ChatMessage;
}) {
  const card = parseReservationCard(message.metadata);
  const reservationId = card?.reservationId ?? 0;
  const reservation = useQuery({
    queryKey: cafeKeys.reservation(reservationId),
    queryFn: () => fetchCafeReservation(reservationId),
    enabled: !!reservationId,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    // 소켓 이벤트를 놓쳐도 채팅 카드가 최신 상태를 따라오도록 한다.
    refetchInterval: 10000,
  });
  const status = reservation.data?.statusDescription;
  return (
    <div className="flex flex-col gap-2.5">
      {card && (
        <section
          aria-label="공유된 예약 및 결제 내역"
          className="text-ink rounded-2xl bg-white px-3.5 py-3 font-normal"
        >
          <h3 className="text-mint-deep flex items-center gap-1.5 text-[13px] font-bold">
            <ReceiptText aria-hidden className="size-4" />
            예약·결제 내역
          </h3>
          <p className="mt-2 text-[17px] leading-6 font-bold">
            {card.storeName}
          </p>
          <dl className="mt-3 space-y-2 text-[13px] leading-5">
            {(status || card.statusDescription) && (
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">예약 상태</dt>
                <dd role="status" className="text-mint-deep font-bold">
                  {status ?? `${card.statusDescription} (공유 당시)`}
                </dd>
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <dt className="text-ink-muted shrink-0">예약 일시</dt>
              <dd className="text-right font-bold">
                {formatProposalDate(card.reservationDate, card.reservationTime)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-muted">예약 인원</dt>
              <dd>{card.guestCount}명</dd>
            </div>
          </dl>
          {card.orderedItems.length > 0 && (
            <ul
              aria-label="주문 메뉴"
              className="border-line mt-3 space-y-1 border-t pt-3 text-[13px] leading-5"
            >
              {card.orderedItems.map((item, index) => (
                <li
                  key={`${item.menuName}-${index}`}
                  className="flex justify-between gap-3"
                >
                  <span>{item.menuName}</span>
                  <span className="shrink-0">{item.quantity}개</span>
                </li>
              ))}
            </ul>
          )}
          <dl className="bg-mint-50 mt-3 flex justify-between gap-3 rounded-lg px-2.5 py-2 text-[14px] font-bold">
            <dt>결제 금액</dt>
            <dd>{card.finalAmount.toLocaleString('ko-KR')}원</dd>
          </dl>
        </section>
      )}
      {message.content && (
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
      )}
    </div>
  );
}
