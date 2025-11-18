import { NodeType } from "../enums/nodeType.enum";

export type Shape = {
    nodeId: number;
    nodeType: NodeType;
    x: number;
    y: number;
};
