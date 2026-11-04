import { create } from 'zustand';
import {
  acceptChatRequest,
  MOCK_CHAT_REQUESTS,
  type ChatRequest,
} from '@/pages/chat/chatRequests';

interface ChatRequestState {
  requests: ChatRequest[];
  /** 수락하면 채팅방이 만들어지고, 이동할 채팅방 ID를 돌려준다 */
  accept: (id: number) => Promise<number | null>;
  reject: (id: number) => void;
}

// 홈의 알림 뱃지와 요청 확인 화면이 같은 상태를 보도록 스토어에 둔다
export const useChatRequestStore = create<ChatRequestState>((set, get) => ({
  requests: MOCK_CHAT_REQUESTS,
  accept: async (id) => {
    const target = get().requests.find((request) => request.id === id);
    if (target?.status !== 'pending') return null;

    const { chatRoomId } = await acceptChatRequest(id);
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === id
          ? { ...request, status: 'accepted', chatRoomId }
          : request,
      ),
    }));
    return chatRoomId;
  },
  reject: (id) =>
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === id && request.status === 'pending'
          ? { ...request, status: 'rejected' }
          : request,
      ),
    })),
}));

export const selectPendingCount = (state: ChatRequestState) =>
  state.requests.filter((request) => request.status === 'pending').length;
