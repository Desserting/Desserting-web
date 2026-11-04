import { create } from 'zustand';

export interface SignupProfile {
  nickname: string;
  bio: string;
  avatar: File | null;
}

interface SignupState {
  interests: string[];
  profile: SignupProfile | null;
  toggleInterest: (id: string) => void;
  setProfile: (profile: SignupProfile) => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  interests: [],
  profile: null,
  toggleInterest: (id) =>
    set((state) => ({
      interests: state.interests.includes(id)
        ? state.interests.filter((interest) => interest !== id)
        : [...state.interests, id],
    })),
  setProfile: (profile) => set({ profile }),
}));
