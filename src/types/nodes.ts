export function isCoverageDemand(node: GraphNode): node is CoverageDemand {
    return (
        node !== null &&
        typeof node === 'object' &&
        'posX' in node &&
        'posY' in node &&
        'cost' in node
    );
}

export function isFacilityDemand(node: GraphNode): node is FacilityDemand {
    return (
        node !== null &&
        typeof node === 'object' &&
        'cost' in node &&
        !('posX' in node) &&
        !('posY' in node)
    );
}

export function isCoverageNode(node: GraphNode): node is CoverageNode {
    return (
        node !== null &&
        typeof node === 'object' &&
        'posX' in node &&
        'posY' in node
    );
}

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