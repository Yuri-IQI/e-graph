import { create } from "zustand";

type MapDisplayState = {
    isShowing: boolean;
    toggleMap: () => void;
};

export const useMapDisplayStore = create<MapDisplayState>((set) => ({
    isShowing: false,
    toggleMap: () => set((prev) => ({ isShowing: !prev.isShowing })),
}));