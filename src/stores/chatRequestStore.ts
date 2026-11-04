import { create } from 'zustand';
import {
  MOCK_CHAT_REQUESTS,
  type ChatRequest,
  type ChatRequestStatus,
} from '@/pages/notifications/chatRequests';

interface ChatRequestState {
  requests: ChatRequest[];
  respond: (id: number, status: Exclude<ChatRequestStatus, 'pending'>) => void;
}

// 홈의 알림 뱃지와 요청 확인 화면이 같은 상태를 보도록 스토어에 둔다
export const useChatRequestStore = create<ChatRequestState>((set) => ({
  requests: MOCK_CHAT_REQUESTS,
  respond: (id, status) =>
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === id && request.status === 'pending'
          ? { ...request, status }
          : request,
      ),
    })),
}));

export const selectPendingCount = (state: ChatRequestState) =>
  state.requests.filter((request) => request.status === 'pending').length;
