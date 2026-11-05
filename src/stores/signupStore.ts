import { create } from 'zustand';

export interface SignupProfile {
  nickname: string;
  bio: string;
  avatar: File | null;
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
  interests: string[];
  profile: SignupProfile | null;
  setAccount: (account: SignupAccount) => void;
  toggleInterest: (id: string) => void;
  setProfile: (profile: SignupProfile) => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  account: null,
  interests: [],
  profile: null,
  setAccount: (account) => set({ account }),
  toggleInterest: (id) =>
    set((state) => ({
      interests: state.interests.includes(id)
        ? state.interests.filter((interest) => interest !== id)
        : [...state.interests, id],
    })),
  setProfile: (profile) => set({ profile }),
}));
