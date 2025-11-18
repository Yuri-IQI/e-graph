import { NodeType } from "@/types/enums/nodeType.enum";
import { Shape } from "@/types/geometries/shape";
import { create } from "zustand";

export const useShapeStore = create<{
    shapes: Shape[];
    addShape: (s: Shape) => void;
    delShape: (id: number) => void;
    hasShapeForNode: (id: number, type: NodeType) => boolean;
}>((set, get) => ({
    shapes: [],
    addShape: (s) => set((st) => ({ shapes: [...st.shapes, s] })),
    delShape: (nodeId) => set((st) => ({ shapes: st.shapes.filter((shape) => shape.nodeId !== nodeId), })),
    hasShapeForNode: (id, nodeType) => get().shapes.some((s) => (s.nodeId === id) && (s.nodeType === nodeType)),
}));