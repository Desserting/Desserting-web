import { api, type ApiResponse } from '@/lib/axios';
import { toList } from './list';

// TODO: 백엔드를 띄운 뒤 `npm run gen:api`로 생성되는 src/types/api.d.ts 타입으로 교체한다.
// 아래 타입은 프론트엔드 연동 가이드 문서 기준이며, 가이드에 없는 필드는 선택(?)으로 두었다.

export type ChatMessageType =
  'TEXT' | 'IMAGE' | 'PLACE_PROPOSAL' | 'RESERVATION_CARD' | 'SYSTEM';

export interface ChatRoom {
  roomId: number;
  otherUserId?: number;
  otherUserNickname: string;
  otherUserAvatarUrl?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  /** 상대가 방을 나갔으면 true. 이때는 메시지를 보낼 수 없다 */
  otherUserLeft?: boolean;
}

export interface ChatMessage {
  messageId: string;
  roomId: number;
  senderId: number;
  senderNickname: string;
  senderAvatarUrl?: string | null;
  messageType: ChatMessageType;
  content: string;
  metadata?: unknown;
  createdAt: string;
}

/**
 * 받은 PLACE_PROPOSAL의 metadata.
 * 직접 제안은 proposedDate가 있고, 예전 제안에는 proposedTime도 있다.
 * AI 추천 카드는 날짜·시간 없이(일시 미정)
 * storeAddress·recommendedMenus·reason을 담아 온다.
 */
export interface ReceivedProposal {
  storeId?: number;
  storeName: string;
  storeAddress?: string;
  recommendedMenus?: string[];
  reason?: string;
  proposedDate?: string;
  proposedTime?: string;
}

export interface ReceivedReservationCard {
  reservationId: number | null;
  statusDescription: string | null;
  storeName: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  finalAmount: number;
  orderedItems: { menuName: string; quantity: number }[];
}

export function parseReservationCard(
  metadata: unknown,
): ReceivedReservationCard | null {
  let value = metadata;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;
  const card = value as Record<string, unknown>;
  if (
    typeof card.storeName !== 'string' ||
    typeof card.reservationDate !== 'string' ||
    typeof card.reservationTime !== 'string' ||
    typeof card.guestCount !== 'number' ||
    typeof card.finalAmount !== 'number'
  )
    return null;
  return {
    reservationId:
      typeof card.reservationId === 'number' &&
      Number.isSafeInteger(card.reservationId) &&
      card.reservationId > 0
        ? card.reservationId
        : null,
    statusDescription:
      typeof card.statusDescription === 'string'
        ? card.statusDescription
        : null,
    storeName: card.storeName,
    reservationDate: card.reservationDate,
    reservationTime: card.reservationTime.slice(0, 5),
    guestCount: card.guestCount,
    finalAmount: card.finalAmount,
    orderedItems: Array.isArray(card.orderedItems)
      ? card.orderedItems.filter(
          (item): item is { menuName: string; quantity: number } =>
            !!item &&
            typeof item === 'object' &&
            typeof item.menuName === 'string' &&
            typeof item.quantity === 'number',
        )
      : [],
  };
}

export const MESSAGE_PAGE_SIZE = 30;

export const chatKeys = {
  rooms: ['chat', 'rooms'] as const,
  messages: (roomId: number) => ['chat', 'messages', roomId] as const,
};

export async function fetchChatRooms(): Promise<ChatRoom[]> {
  const { data } = await api.get<ApiResponse<unknown>>('/v1/chats/rooms');
  return toList<ChatRoom>(data.data, ['rooms', 'content', 'items']);
}

/** 최신순 한 페이지. cursorId를 주면 그 메시지보다 오래된 것을 가져온다 */
export async function fetchChatMessages(
  roomId: number,
  cursorId?: string,
): Promise<ChatMessage[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    `/v1/chats/rooms/${roomId}/messages`,
    { params: { size: MESSAGE_PAGE_SIZE, cursorId } },
  );
  return toList<ChatMessage>(data.data, ['messages', 'content', 'items']);
}

export async function leaveChatRoom(roomId: number): Promise<void> {
  await api.post(`/v1/chats/rooms/${roomId}/leave`);
}

/** 서버가 예약·결제 데이터를 확인해 공유 카드를 생성하고 양쪽 채팅방에 보낸다. */
export async function shareCafeReservation(
  roomId: number,
  reservationId: number,
) {
  const { data } = await api.post<ApiResponse<ChatMessage>>(
    `/v1/chats/rooms/${roomId}/share-reservation`,
    { reservationId },
  );
  return data.data;
}

/** 방을 보는 중 실시간으로 받은 메시지를 읽음 처리한다. 첫 페이지 조회는 서버가 자동으로 읽음 처리한다 */
export async function markChatRoomRead(roomId: number): Promise<void> {
  await api.post(`/v1/chats/rooms/${roomId}/read`);
}

/** 로컬 AI(Ollama)가 느리면 15초 가까이 걸릴 수 있어 넉넉하게 기다린다 */
const AI_RECOMMENDATION_TIMEOUT_MS = 40_000;

/**
 * AI가 추천한 카페. 같은 내용이 PLACE_PROPOSAL 카드로 채팅방(STOMP)에도 양쪽에 전달되므로,
 * 화면에 카드를 그릴 때는 이 응답이 아니라 소켓으로 받은 메시지를 쓴다.
 */
export interface AiRecommendation {
  roomId: number;
  storeId: number;
  storeName: string;
  storeAddress?: string;
  recommendedMenus?: string[];
  reason?: string;
  /** 추천을 만든 엔진 (`OLLAMA_LOCAL_QWEN` 또는 `SMART_KEYWORD_FALLBACK`) */
  source?: string;
}

/** 대화 내용을 보고 어울리는 제휴 카페를 골라 채팅방에 카드로 보낸다 */
export async function requestAiRecommendation(
  roomId: number,
): Promise<AiRecommendation> {
  const { data } = await api.post<ApiResponse<AiRecommendation>>(
    `/v1/chats/rooms/${roomId}/ai-recommendation`,
    undefined,
    { timeout: AI_RECOMMENDATION_TIMEOUT_MS },
  );
  return data.data;
}

/** PLACE_PROPOSAL metadata가 객체 또는 JSON 문자열로 올 수 있어 둘 다 처리한다 */
export function parseProposal(metadata: unknown): ReceivedProposal | null {
  let value = metadata;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;
  const {
    storeId,
    storeName,
    storeAddress,
    recommendedMenus,
    reason,
    proposedDate,
    proposedTime,
  } = value as Record<string, unknown>;
  if (typeof storeName !== 'string') return null;

  const text = (field: unknown) =>
    typeof field === 'string' && field ? field : undefined;
  const menus = Array.isArray(recommendedMenus)
    ? recommendedMenus.filter(
        (menu): menu is string => typeof menu === 'string',
      )
    : [];

  return {
    storeId: storeId === undefined ? undefined : Number(storeId),
    storeName,
    storeAddress: text(storeAddress),
    recommendedMenus: menus.length > 0 ? menus : undefined,
    reason: text(reason),
    proposedDate: text(proposedDate),
    proposedTime: text(proposedTime),
  };
}
