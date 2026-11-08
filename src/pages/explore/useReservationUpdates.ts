import { Client } from '@stomp/stompjs';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cafeKeys, type CafeReservation } from '@/api/cafeBooking';
import { refreshAccessToken } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

const statusLabels: Record<CafeReservation['status'], string> = {
  PENDING: '승인 대기',
  CONFIRMED: '예약 승인',
  PREPARING: '준비 중',
  COMPLETED: '준비 완료',
  CANCELLED: '예약 취소',
};

export function useReservationUpdates(reservationId: number) {
  const token = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!reservationId || !token) return;
    const url = new URL(
      import.meta.env.VITE_API_BASE_URL,
      window.location.origin,
    );
    let authRetried = false;
    const refresh = () => {
      for (const queryKey of [
        cafeKeys.reservation(reservationId),
        cafeKeys.receipt(reservationId),
        cafeKeys.reservations,
        cafeKeys.orders,
      ])
        void queryClient.invalidateQueries({ queryKey });
    };
    // 기존 채팅과 동일한 네이티브 WebSocket STOMP 연결을 사용한다.
    const client = new Client({
      brokerURL: `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/ws`,
      reconnectDelay: 3000,
      beforeConnect: () => {
        client.connectHeaders = {
          Authorization: `Bearer ${useAuthStore.getState().accessToken ?? ''}`,
        };
      },
      onConnect: () => {
        refresh();
        client.subscribe(`/sub/reservations/${reservationId}`, (frame) => {
          try {
            const event = JSON.parse(frame.body);
            if (
              event.type !== 'RESERVATION_STATUS_CHANGED' ||
              event.reservationId !== reservationId ||
              !Object.hasOwn(statusLabels, event.status)
            )
              return;
            setNotice({
              id: reservationId,
              text: `예약 상태가 변경되었어요: ${statusLabels[event.status as CafeReservation['status']]}`,
            });
            refresh();
          } catch {
            // 잘못된 이벤트를 받아도 최신 데이터는 REST API로 확인한다.
            refresh();
          }
        });
      },
      onStompError: () => {
        if (authRetried) {
          void client.deactivate();
          return;
        }
        authRetried = true;
        void refreshAccessToken().catch(() => client.deactivate());
      },
    });
    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [reservationId, token, queryClient]);

  return notice?.id === reservationId ? notice.text : null;
}
