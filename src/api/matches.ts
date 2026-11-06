import { api, type ApiResponse } from '@/lib/axios';
import { toList } from './list';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

/** 받은 대화 요청 */
export interface ReceivedRequest {
  /** 수락·거절 경로에 쓰는 id */
  requestId: number;
  senderId: number;
  senderNickname: string;
  senderAvatarUrl?: string | null;
  senderAge?: number;
  senderRegion?: string;
  senderDessertTags?: string[];
  status: RequestStatus;
  createdAt: string;
  expiredAt: string;
  /** 수락된 요청이면 만들어진 채팅방 id (`GET /chats/rooms`의 roomId와 같은 값) */
  chatRoomId: number | null;
}

/** 내가 보낸 대화 요청 */
export interface SentRequest {
  requestId: number;
  receiverId: number;
  receiverNickname: string;
  receiverAvatarUrl?: string | null;
  receiverAge?: number;
  receiverRegion?: string;
  status: RequestStatus;
  createdAt: string;
  expiredAt?: string;
  /** 수락된 요청이면 만들어진 채팅방 id */
  chatRoomId?: number | null;
}

export interface AcceptedRequest {
  requestId: number;
  chatRoomId: number;
  roomUuid?: string;
  message?: string;
}

/** 대화 요청 1건당 차감되는 하트 수 (프리미엄은 무료) */
export const REQUEST_HEART_COST = 1;

export const matchKeys = {
  received: ['matches', 'received'] as const,
  sent: ['matches', 'sent'] as const,
};

/**
 * 내가 대화 요청을 보낸 상대 목록. 받은 요청과 같은 방식으로 최근 처리 결과까지 함께 온다.
 * TODO: 백엔드 경로가 다르면 여기만 고친다.
 */
export async function fetchSentRequests(): Promise<SentRequest[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    '/v1/matches/requests/sent',
    { params: { includeProcessed: true } },
  );
  return toList<SentRequest>(data.data, ['requests', 'content', 'items']);
}

/**
 * 받은 요청 목록. 기본은 PENDING만 오고, includeProcessed를 주면 최근 7일의
 * ACCEPTED·REJECTED·EXPIRED도 와서 새로고침 후에도 처리 결과를 보여줄 수 있다.
 */
export async function fetchReceivedRequests(): Promise<ReceivedRequest[]> {
  const { data } = await api.get<ApiResponse<unknown>>(
    '/v1/matches/requests/received',
    { params: { includeProcessed: true } },
  );
  return toList<ReceivedRequest>(data.data, ['requests', 'content', 'items']);
}

/** 수락하면 서버가 채팅방을 만들고 바로 양쪽 채팅 목록에 보인다 */
export async function acceptRequest(
  requestId: number,
): Promise<AcceptedRequest> {
  const { data } = await api.post<ApiResponse<AcceptedRequest>>(
    `/v1/matches/requests/${requestId}/accept`,
  );
  return data.data;
}

export async function rejectRequest(requestId: number): Promise<void> {
  await api.post(`/v1/matches/requests/${requestId}/reject`);
}

/**
 * 대화 요청을 보낸다. 하트 1개가 차감되고(프리미엄은 무료), 응답에는 남은 하트 수가
 * 없으므로 보낸 뒤 GET /users/me를 다시 불러야 한다.
 */
export async function sendChatRequest(
  receiverId: number,
): Promise<ReceivedRequest> {
  const { data } = await api.post<ApiResponse<ReceivedRequest>>(
    '/v1/matches/requests',
    { receiverId },
  );
  return data.data;
}

/** 수락·거절 실패 코드별 안내 문구 */
export const REQUEST_ERROR_MESSAGES: Record<string, string> = {
  H003: '요청을 찾을 수 없어요.',
  H005: '이미 처리된 요청이에요.',
  H006: '만료된 요청이에요.',
};

export const countPending = (requests: ReceivedRequest[]) =>
  requests.filter((request) => request.status === 'PENDING').length;
