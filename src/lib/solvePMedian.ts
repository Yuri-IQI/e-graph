import { DemandAssigment, SolutionSet } from "@/types/assignment";
import { getCombinations } from "./common";

import { FacilityNode } from "@/types/nodes";

export const buildCostMatrix = (
    facilities: FacilityNode[]
): number[][] | null => {

    if (!facilities?.length) return null;

    const validFacilities = facilities.filter(f =>
        f.demand.every(d => typeof d.cost === "number" && !Number.isNaN(d.cost))
    );

    if (!validFacilities.length) return null;

    const clientCount = validFacilities[0].demand.length;
    if (!validFacilities.every(f => f.demand.length === clientCount)) return null;

    validFacilities.forEach(f =>
        f.demand.sort((a, b) => a.id - b.id)
    );

    return Array.from({ length: clientCount }, (_, clientIdx) =>
        validFacilities.map(f => f.demand[clientIdx].cost)
    );
};

export const solvePMedian = (
    costMatrix: number[][],
    p: number
): SolutionSet => {

    const nClients = costMatrix.length;
    const nFacilities = costMatrix[0].length;

    const facilityIds = [...Array(nFacilities).keys()];

    let bestCost = Infinity;
    let bestFacilities: number[] = [];

    for (const combo of getCombinations(facilityIds, p)) {
        let totalCost = 0;

        for (let c = 0; c < nClients; c++) {
            let minCost = Infinity;
            for (const f of combo) {
                if (costMatrix[c][f] < minCost) minCost = costMatrix[c][f];
            }
            totalCost += minCost;
        }

        if (totalCost < bestCost) {
            bestCost = totalCost;
            bestFacilities = combo;
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