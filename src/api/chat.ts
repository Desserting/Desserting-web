import { api, type ApiResponse } from '@/lib/axios';

// TODO: 백엔드를 띄운 뒤 `npm run gen:api`로 생성되는 src/types/api.d.ts 타입으로 교체한다.
// 아래 타입은 프론트엔드 연동 가이드 문서 기준이며, 가이드에 없는 필드는 선택(?)으로 두었다.

export type ChatMessageType = 'TEXT' | 'IMAGE' | 'PLACE_PROPOSAL' | 'SYSTEM';

export interface ChatRoom {
  roomId: number;
  otherUserNickname: string;
  otherUserAvatarUrl?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
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

/** 받은 PLACE_PROPOSAL의 metadata. AI 추천 카드는 날짜·시간 없이(일시 미정) 올 수 있다 */
export interface ReceivedProposal {
  storeId?: number;
  storeName: string;
  proposedDate?: string;
  proposedTime?: string;
}

export const MESSAGE_PAGE_SIZE = 30;

export const chatKeys = {
  rooms: ['chat', 'rooms'] as const,
  messages: (roomId: number) => ['chat', 'messages', roomId] as const,
};

/** 목록 응답이 배열이든, 페이지 객체로 감싸져 있든 배열만 꺼낸다 */
function toList<T>(data: unknown, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    for (const key of keys) {
      const value = (data as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

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
  const { storeId, storeName, proposedDate, proposedTime } = value as Record<
    string,
    unknown
  >;
  if (typeof storeName !== 'string') return null;
  return {
    storeId: storeId === undefined ? undefined : Number(storeId),
    storeName,
    proposedDate: typeof proposedDate === 'string' ? proposedDate : undefined,
    proposedTime: typeof proposedTime === 'string' ? proposedTime : undefined,
  };
}
