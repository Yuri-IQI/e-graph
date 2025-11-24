import { CoverageDemand, FacilityDemand, GraphNode } from "@/types/nodes";
import { create } from "zustand";

export type ClientUnion = FacilityDemand | CoverageDemand;

type ClientStoreState = {
    clientNodes: ClientUnion[];
    selectedClient: ClientUnion | null;

    selectClient: (node: ClientUnion) => void;
    clearClientSelection: () => void;

    setClients: (nodes: ClientUnion[]) => void;
    addClient: (node: ClientUnion) => void;
    updateClient: (updated: ClientUnion) => void;
    removeClient: (id: number) => void;
};

export const useClientStore = create<ClientStoreState>((set, get) => ({
    clientNodes: [],
    selectedClient: null,

    selectClient: (node) => set({ selectedClient: node }),
    clearClientSelection: () => set({ selectedClient: null }),

    setClients: (nodes) => {
        const { selectedClient } = get();
        const updatedSelected =
            selectedClient && nodes.find((c) => c.id === selectedClient.id);

        set({
            clientNodes: nodes,
            selectedClient: updatedSelected ? { ...updatedSelected } : selectedClient,
        });
    },

    addClient: (node) =>
        set((st) => ({ clientNodes: [...st.clientNodes, node] })),

    updateClient: (updated) =>
        set((st) => {
            const idx = st.clientNodes.findIndex(c => c.id === updated.id);
            if (idx === -1) return st;

            const newClients = [...st.clientNodes];
            newClients[idx] = updated;

            return {
                clientNodes: newClients,
                selectedClient:
                    st.selectedClient?.id === updated.id ? updated : st.selectedClient,
            };
        }),


    removeClient: (id) =>
        set((st) => ({
            clientNodes: st.clientNodes.filter((c) => c.id !== id),
            selectedClient: st.selectedClient?.id === id ? null : st.selectedClient,
        })),
}));