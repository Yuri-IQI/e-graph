export interface GraphNode {
    id: number;
    value: string;
}

export interface FacilityDemand extends GraphNode {
    cost: number;
}

export interface FacilityNode extends GraphNode {
    isPlaced: boolean;
    demand: FacilityDemand[];
}