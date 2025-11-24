export interface GraphNode {
    id: number;
    value: string;
    isPlaced: boolean;
}

export interface FacilityDemand extends GraphNode {
    cost: number;
};

export interface FacilityNode extends GraphNode {
    demand: FacilityDemand[];
};

export interface CoverageNode extends GraphNode {
    posX: number | null;
    posY: number | null;
}

export interface CoverageDemand extends CoverageNode {
    cost: number; 
    assignedFacilities?: CoverageNode[];
}