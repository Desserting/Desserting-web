import { create } from 'zustand';

/** 대화 요청 1건당 차감되는 하트 수 */
export const REQUEST_HEART_COST = 1;

/** 가입 시 지급되는 하트 수 (WELCOME_BONUS) */
const WELCOME_HEARTS = 5;

export interface HeartHistoryItem {
  id: number;
  /** 대화 요청으로 하트가 차감된 기록 */
  type: 'REQUEST_DEDUCT';
  /** 변동 수량. 차감은 음수 */
  amount: number;
  targetNickname: string;
  balanceAfter: number;
  createdAt: string;
  read: boolean;
}

export type SpendResult = 'deducted' | 'free' | 'insufficient';

interface HeartState {
  heartCount: number;
  isPremium: boolean;
  history: HeartHistoryItem[];
  /** 대화 요청에 하트를 쓴다. 프리미엄은 차감 없이 통과하고, 부족하면 아무것도 바꾸지 않는다 */
  spendForRequest: (targetNickname: string) => SpendResult;
  markAllRead: () => void;
}

// TODO: GET /users/me(heartCount, isPremium), GET /hearts/history 연동 시 교체 (현재는 임시 값)
export const useHeartStore = create<HeartState>((set, get) => ({
  heartCount: WELCOME_HEARTS,
  isPremium: false,
  history: [],
  spendForRequest: (targetNickname) => {
    const { heartCount, isPremium } = get();
    if (isPremium) return 'free';
    if (heartCount < REQUEST_HEART_COST) return 'insufficient';

    const balanceAfter = heartCount - REQUEST_HEART_COST;
    set((state) => ({
      heartCount: balanceAfter,
      history: [
        {
          id: Date.now(),
          type: 'REQUEST_DEDUCT',
          amount: -REQUEST_HEART_COST,
          targetNickname,
          balanceAfter,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.history,
      ],
    }));
    return 'deducted';
  },
  markAllRead: () =>
    set((state) =>
      state.history.some((item) => !item.read)
        ? {
            history: state.history.map((item) => ({ ...item, read: true })),
          }
        : state,
    ),
}));

export const selectUnreadHeartCount = (state: HeartState) =>
  state.history.filter((item) => !item.read).length;
