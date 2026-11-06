import { create } from 'zustand';

export interface SignupProfile {
  nickname: string;
  bio: string;
}

export interface SignupAccount {
  email: string;
  password: string;
  gender: 'FEMALE' | 'MALE';
  age: number;
  region: string;
}

interface SignupState {
  account: SignupAccount | null;
  /** 서버의 DessertType 코드 */
  interests: string[];
  profile: SignupProfile | null;
  setAccount: (account: SignupAccount) => void;
  toggleInterest: (id: string) => void;
  setProfile: (profile: SignupProfile) => void;
  /** 가입이 끝나면 비밀번호까지 들어 있는 입력값을 메모리에서 지운다 */
  reset: () => void;
}

const initialState = { account: null, interests: [], profile: null };

export const useSignupStore = create<SignupState>((set) => ({
  ...initialState,
  setAccount: (account) => set({ account }),
  toggleInterest: (id) =>
    set((state) => ({
      interests: state.interests.includes(id)
        ? state.interests.filter((interest) => interest !== id)
        : [...state.interests, id],
    })),
  setProfile: (profile) => set({ profile }),
  reset: () => set(initialState),
}));
