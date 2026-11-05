import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationState {
  /** 알림 화면에서 마지막으로 확인한 하트 내역 id. 서버에는 읽음 표시가 없어 이 기기에만 기억한다 */
  lastSeenHeartHistoryId: number;
  markHeartHistorySeen: (id: number) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      lastSeenHeartHistoryId: 0,
      markHeartHistorySeen: (id) =>
        set((state) =>
          id > state.lastSeenHeartHistoryId
            ? { lastSeenHeartHistoryId: id }
            : state,
        ),
    }),
    { name: 'desserting-notifications' },
  ),
);
