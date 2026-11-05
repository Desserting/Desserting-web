import { create } from 'zustand';

/** 대화 요청 1건당 차감되는 하트 수 */
export const REQUEST_HEART_COST = 1;

/** 가입 시 지급되는 하트 수 (WELCOME_BONUS) */
const WELCOME_HEARTS = 5;

export type SpendResult = 'deducted' | 'free' | 'insufficient';

interface HeartState {
  heartCount: number;
  isPremium: boolean;
  /** 대화 요청에 하트를 쓴다. 프리미엄은 차감 없이 통과하고, 부족하면 아무것도 바꾸지 않는다 */
  spendForRequest: (targetNickname: string) => SpendResult;
}

// TODO: 프로필·매칭 카드를 서버 데이터로 바꾸고 POST /matches/requests를 연결할 때 이 스토어를 없앤다.
// 하트 수·프리미엄 여부는 GET /users/me, 알림은 GET /hearts/history로 이미 서버 값을 쓰고 있고,
// 지금은 목업 후보에게 보내는 요청 화면만 이 임시 값을 쓴다.
export const useHeartStore = create<HeartState>((set, get) => ({
  heartCount: WELCOME_HEARTS,
  isPremium: false,
  spendForRequest: () => {
    const { heartCount, isPremium } = get();
    if (isPremium) return 'free';
    if (heartCount < REQUEST_HEART_COST) return 'insufficient';

    set({ heartCount: heartCount - REQUEST_HEART_COST });
    return 'deducted';
  },
}));
