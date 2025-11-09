import { Formulation } from "@/types/enums/formulation.enum";
import { FacilityNode } from "@/types/nodes";
import { a } from "framer-motion/client";

/**
 * Return all k-combinations of an array.
 */
const getCombinations = <T>(arr: T[], k: number): T[][] => {
    if (k === 0) return [[]];
    if (arr.length === 0) return [];
    const [first, ...rest] = arr;
    return [
        ...getCombinations(rest, k - 1).map((c) => [first, ...c]),
        ...getCombinations(rest, k),
    ];
};

/**
 * Solve the p-median problem via brute force.
 */
const solvePMedian = (costMatrix: number[][], p: number) => {
    const nClients = costMatrix.length;
    const nFacilities = costMatrix[0].length;

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

    const assignments = costMatrix.map((row, clientIdx) => {
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

/**
 * Convert facility demand lists to a cost matrix:
 *   rows = clients
 *   columns = facilities
 */
const buildCostMatrix = (facilities: FacilityNode[]): number[][] | null => {
    if (!facilities?.length) return null;

    // Ensure all facilities have cost assigned
    const validFacilities = facilities.filter(f =>
        f.demand.every(d => typeof d.cost === "number" && !Number.isNaN(d.cost))
    );

    if (validFacilities.length === 0) return null;

    // Validate consistent number of clients
    const clientCount = validFacilities[0].demand.length;
    if (!validFacilities.every(f => f.demand.length === clientCount)) return null;

    // Sort client demand lists by client id, ensuring index = id
    validFacilities.forEach(f =>
        f.demand.sort((a, b) => a.id - b.id)
    );

    return Array.from({ length: clientCount }, (_, clientIdx) =>
        validFacilities.map(facility => facility.demand[clientIdx].cost)
    );
};

export const solveLocationProblem = (
    type: Formulation,
    facilityLimit: number,
    facilities: FacilityNode[]
) => {
    const costMatrix = buildCostMatrix(facilities);
    if (!costMatrix) {
        console.warn("[solveLocationProblem] Incomplete cost data or invalid facilities.");
        return null;
    }

    if (type === Formulation.PMEDIAN) {
        return solvePMedian(costMatrix, facilityLimit);
    }

    console.warn(`[solveLocationProblem] Formulation type '${type}' not implemented.`);
    return null;
};