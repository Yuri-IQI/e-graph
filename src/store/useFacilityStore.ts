import { FacilityNode } from "@/types/nodes";
import { create } from "zustand";

type FacilityStoreState = {
    facilityNodes: FacilityNode[];
    selectedFacility: FacilityNode | null;

    selectFacility: (node: FacilityNode) => void;
    clearFacilitySelection: () => void;

    setFacilities: (nodes: FacilityNode[]) => void;
    addFacility: (node: FacilityNode) => void;
    updateFacility: (updated: FacilityNode) => void;
    removeFacility: (id: number) => void;
};

export const useFacilityStore = create<FacilityStoreState>((set) => ({
    facilityNodes: [],
    selectedFacility: null,

    selectFacility: (node) => set({ selectedFacility: node }),
    clearFacilitySelection: () => set({ selectedFacility: null }),

    setFacilities: (nodes) => set({ facilityNodes: nodes }),
    addFacility: (node) =>
        set((state) => ({ facilityNodes: [...state.facilityNodes, node] })),

    updateFacility: (updated) =>
        set((state) => ({
            facilityNodes: state.facilityNodes.map((f) =>
                f.id === updated.id ? updated : f
            ),
            selectedFacility:
                state.selectedFacility?.id === updated.id
                    ? updated
                    : state.selectedFacility,
        })),

    removeFacility: (id) =>
        set((state) => ({
            facilityNodes: state.facilityNodes.filter((f) => f.id !== id),
            selectedFacility:
                state.selectedFacility?.id === id ? null : state.selectedFacility,
        })),
}));