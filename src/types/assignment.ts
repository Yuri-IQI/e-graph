export interface DemandAssigment {
    client: number,
    facility: number,
    cost: number
};

export interface SolutionSet {
    bestCost: number,
    bestFacilities: number[],
    assignments: DemandAssigment[]
};