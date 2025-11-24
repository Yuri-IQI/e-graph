import { NodeType } from "@/types/enums/nodeType.enum";
import { Shape } from "@/types/geometries/shape";
import { create } from "zustand";

export const useShapeStore = create<{
    shapes: Shape[];
    addShape: (s: Shape) => void;
    updateShape: (shapeId: number, updates: Partial<Shape>) => void;
    delShape: (shapeId: number) => void;
    hasShapeForNode: (id: number, type: NodeType) => boolean;
}>((set, get) => ({
    shapes: [],

    addShape: (s) =>
        set((st) => ({ shapes: [...st.shapes, s] })),

    updateShape: (shapeId, updates) =>
        set((st) => ({
            shapes: st.shapes.map((shape) =>
                shape.shapeId === shapeId
                    ? { ...shape, ...updates }
                    : shape
            ),
        })),

    delShape: (shapeId) =>
        set((st) => ({
            shapes: st.shapes.filter((shape) => shape.shapeId !== shapeId),
        })),

    hasShapeForNode: (id, nodeType) =>
        get().shapes.some(
            (s) => s.nodeId === id && s.nodeType === nodeType
        ),
}));