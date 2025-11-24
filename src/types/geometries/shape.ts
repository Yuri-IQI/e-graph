import { NodeType } from "../enums/nodeType.enum";

export type Shape = {
    shapeId: number;
    nodeId: number;
    nodeType: NodeType;
    x: number;
    y: number;
};
