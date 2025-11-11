import { DemandAssigment, SolutionSet } from "@/types/assignment";
import { Formulation } from "@/types/enums/formulation.enum";
import { FacilityNode } from "@/types/nodes";

const getCombinations = <T>(arr: T[], p: number): T[][] => {
    if (p === 0) return [[]];
    if (arr.length === 0) return [];
    const [first, ...rest] = arr;
    return [
        ...getCombinations(rest, p - 1).map((c) => [first, ...c]),
        ...getCombinations(rest, p),
    ];
};

const solvePMedian = (
    costMatrix: number[][],
    p: number,
    clientWeights: number[]
): SolutionSet => {
    const nClients = costMatrix.length;
    const nFacilities = costMatrix[0].length;

    if (clientWeights.length !== nClients) {
        throw new Error("Client weights array size must match the number of clients.");
    }

    const facilityIds = [...Array(nFacilities).keys()];

    let bestCost = Infinity;
    let bestFacilities: number[] = [];

    for (const combination of getCombinations(facilityIds, p)) {
        let totalCost = 0;

        for (let c = 0; c < nClients; c++) {
            let minCost = Infinity;
            for (const f of combination) {
                const cost = costMatrix[c][f];
                if (cost < minCost) minCost = cost;
            }
            totalCost += minCost;  
        }

        if (totalCost < bestCost) {
            bestCost = totalCost;
            bestFacilities = combination;
        }
    }

    const assignments: DemandAssigment[] = costMatrix.map((row, clientIdx) => {
        let bestFacility = -1;
        let minCost = Infinity;
        for (const f of bestFacilities) {
            if (row[f] < minCost) {
                minCost = row[f];
                bestFacility = f;
            }
        }
        return { client: clientIdx, facility: bestFacility, cost: minCost };
    });

    return { bestCost, bestFacilities, assignments };
};

const buildCostMatrix = (facilities: FacilityNode[]): number[][] | null => {
    if (!facilities?.length) return null;

    const validFacilities = facilities.filter(f =>
        f.demand.every(d => typeof d.cost === "number" && !Number.isNaN(d.cost))
    );

    if (validFacilities.length === 0) return null;

    const clientCount = validFacilities[0].demand.length;
    if (!validFacilities.every(f => f.demand.length === clientCount)) return null;

    validFacilities.forEach(f =>
        f.demand.sort((a, b) => a.id - b.id)
    );

    return Array.from({ length: clientCount }, (_, clientIdx) =>
        validFacilities.map(facility => facility.demand[clientIdx].cost)
    );
};

const extractClientWeights = (facilities: FacilityNode[]): number[] | null => {
    const referenceFacility = facilities.find(f => f.demand.length > 0);
    
    if (!referenceFacility) return null;

    const sortedDemands = [...referenceFacility.demand].sort((a, b) => a.id - b.id);

    return sortedDemands.map(d => d.cost);
};


export const solveLocationProblem = (
    type: Formulation,
    facilityLimit: number,
    facilities: FacilityNode[]
) => {
    const costMatrix = buildCostMatrix(facilities);
    if (!costMatrix || !costMatrix.length) {
        console.warn("[solveLocationProblem] Incomplete cost data or invalid facilities.");
        return null;
    }

    const clientWeights = extractClientWeights(facilities);
    if (!clientWeights || clientWeights.length !== costMatrix.length) {
        console.warn("[solveLocationProblem] Could not determine consistent client weights.");
        return null;
    }

    if (type === Formulation.PMEDIAN) {
        return solvePMedian(costMatrix, facilityLimit, clientWeights);
    }

    console.warn(`[solveLocationProblem] Formulation type '${type}' not implemented.`);
    return null;
};