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

export const useFacilityStore = create<FacilityStoreState>((set, get) => ({
    facilityNodes: [],
    selectedFacility: null,

    selectFacility: (node) => { console.log(node); set({ selectedFacility: node })},
    clearFacilitySelection: () => set({ selectedFacility: null }),

    setFacilities: (nodes) => {
        const { selectedFacility } = get();

        const updatedSelected =
            selectedFacility &&
            nodes.find((f) => f.id === selectedFacility.id);

        set({
            facilityNodes: nodes,
            selectedFacility: updatedSelected ? { ...updatedSelected } : selectedFacility,
        });
    },

    addFacility: (node) => {
        set((state) => ({
            facilityNodes: [...state.facilityNodes, node],
        }));
    },

    updateFacility: (updated) => {
        set((state) => {
            const newFacilities = state.facilityNodes.map((f) =>
                f.id === updated.id ? { ...updated } : f
            );

            const newSelected =
                state.selectedFacility?.id === updated.id ? { ...updated } : state.selectedFacility;

            return {
                facilityNodes: newFacilities,
                selectedFacility: newSelected,
            };
        });
    },

    removeFacility: (id) => {
        set((state) => ({
            facilityNodes: state.facilityNodes.filter((f) => f.id !== id),
            selectedFacility:
                state.selectedFacility?.id === id ? null : state.selectedFacility,
        }));
    }
}));