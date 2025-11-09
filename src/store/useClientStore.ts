import { GraphNode } from "@/types/nodes";
import { create } from "zustand";

type ClientSelectState = {
    selectedClient: GraphNode | null;
    selectClient: (node: GraphNode) => void;
    clearClientSelection: () => void;
}

export const useClientStore = create<ClientSelectState>((set) => ({
    selectedClient: null,
    selectClient: (node: GraphNode) => set({ selectedClient: node }),
    clearClientSelection: () => set({ selectedClient: null }),
}));