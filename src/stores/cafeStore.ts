import { create } from 'zustand';

type CafeState = {
  likedIds: string[];
  toggleLike: (id: string) => void;
};

export const useCafeStore = create<CafeState>((set) => ({
  likedIds: [],
  toggleLike: (id) =>
    set((state) => ({
      likedIds: state.likedIds.includes(id)
        ? state.likedIds.filter((likedId) => likedId !== id)
        : [...state.likedIds, id],
    })),
}));
