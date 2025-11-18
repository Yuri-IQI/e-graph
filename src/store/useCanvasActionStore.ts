import { create } from "zustand";

export enum ActionEnum {
    POSITION_CLIENT = "Position Client",
    POSITION_FACILITY = "Position Facility",
    EDIT = "Edit",
    DEL = "Delete"
}

type CanvasActionState = {
    activeAction: ActionEnum | null; 
    selectAction: (act: ActionEnum) => void;
    clearActionSelection: () => void;
};

export const useCanvasActionStore = create<CanvasActionState>((set) => ({
    activeAction: null,
    clearActionSelection: () => set({ activeAction: null }),
    selectAction: (act: ActionEnum) =>
        set((state) => ({ activeAction: state.activeAction === act ? null : act })),
}));