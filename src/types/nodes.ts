export interface GraphNode {
    id: number;
    value: string;
};

export interface FacilityDemand extends GraphNode {
    cost: number;
};

export interface FacilityNode extends GraphNode {
    isPlaced: boolean;
    demand: FacilityDemand[];
};

export interface CoverageNode extends GraphNode {
    posX: number,
    posY: number
};

export interface CoverageDemand extends CoverageNode {
    weight: number,
    assignedFacilities: CoverageNode[]
}