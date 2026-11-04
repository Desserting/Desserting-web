import matchPhoto from '@/assets/matching/match-photo.png';
import avatarMacaron from '@/assets/notifications/avatar-macaron.svg';

export type ChatRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface ChatRequest {
  id: number;
  nickname: string;
  avatar: string;
  status: ChatRequestStatus;
}

// TODO: 알림/채팅 요청 API 연동 시 교체 (현재는 디자인 시안 기반 임시 데이터)
export const MOCK_CHAT_REQUESTS: ChatRequest[] = [
  {
    id: 1,
    nickname: '크루아상러버',
    avatar: matchPhoto,
    status: 'pending',
  },
  {
    id: 2,
    nickname: '마카롱좋아',
    avatar: avatarMacaron,
    status: 'pending',
  },
];
