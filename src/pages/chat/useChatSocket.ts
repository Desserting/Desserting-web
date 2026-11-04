import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage, ChatMessageType } from '@/api/chat';
import { refreshAccessToken } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

export type SocketStatus = 'connecting' | 'connected' | 'error';

/** REST 주소(`/api` 또는 `https://host/api`)와 같은 호스트의 `/ws`로 접속한다 */
function getWebSocketUrl(): string {
  const url = new URL(
    import.meta.env.VITE_API_BASE_URL,
    window.location.origin,
  );
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${url.host}/ws`;
}

const bearer = () => ({
  Authorization: `Bearer ${useAuthStore.getState().accessToken ?? ''}`,
});

/**
 * 채팅방 STOMP 연결. `/sub/chat/room/{roomId}`를 구독하고 `/pub/chat/message`로 보낸다.
 * 보낸 사람도 같은 방을 구독 중이라 자기 메시지가 구독으로 되돌아온다.
 */
export function useChatSocket(
  roomId: number,
  onMessage: (message: ChatMessage) => void,
) {
  const [status, setStatus] = useState<SocketStatus>('connecting');
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    let authRetried = false;

    const client = new Client({
      brokerURL: getWebSocketUrl(),
      connectHeaders: bearer(),
      // 재연결할 때마다 재발급된 최신 토큰을 쓴다
      beforeConnect: () => {
        client.connectHeaders = bearer();
      },
      reconnectDelay: 3000,
      onConnect: () => {
        authRetried = false;
        setStatus('connected');
        client.subscribe(`/sub/chat/room/${roomId}`, (frame) => {
          onMessageRef.current(JSON.parse(frame.body) as ChatMessage);
        });
      },
      onWebSocketClose: () => {
        setStatus((current) => (current === 'error' ? current : 'connecting'));
      },
      // 인증 실패·참여자 아님은 원인을 구분할 수 없으므로 토큰 재발급 후 한 번만 재연결한다
      onStompError: () => {
        if (authRetried) {
          setStatus('error');
          void client.deactivate();
          return;
        }
        authRetried = true;
        refreshAccessToken().catch(() => {
          setStatus('error');
          void client.deactivate();
        });
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      clientRef.current = null;
      void client.deactivate();
    };
  }, [roomId]);

  const send = useCallback(
    (
      content: string,
      messageType: ChatMessageType = 'TEXT',
      metadata?: object,
    ) => {
      const client = clientRef.current;
      if (!client?.connected) return false;
      client.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify({
          roomId,
          messageType,
          content,
          metadata: metadata ?? null,
        }),
      });
      return true;
    },
    [roomId],
  );

  return { status, send };
}
