import { DemandAssigment, SolutionSet } from "@/types/assignment";
import { getCombinations } from "./common";

import { CoverageNode, CoverageDemand } from "@/types/nodes";

export const buildCoverageMatrix = (
    facilities: CoverageNode[],
    demands: CoverageDemand[],
    radius: number
): number[][] => {

    return demands.map(d =>
        facilities.map(f => {
            const dist = Math.sqrt(
                (d.posX - f.posX) ** 2 +
                (d.posY - f.posY) ** 2
            );
            return dist <= radius ? 1 : 0;
        })
    );
};

export const solveMCLP = (
    coverageMatrix: number[][],
    weights: number[],
    p: number
): SolutionSet => {

    const nDemands = coverageMatrix.length;
    const nFacilities = coverageMatrix[0].length;

    const facilityIds = [...Array(nFacilities).keys()];

    let bestCoverage = -1;
    let bestFacilities: number[] = [];

    for (const combo of getCombinations(facilityIds, p)) {
        let coveredWeight = 0;

        for (let d = 0; d < nDemands; d++) {
            const isCovered = combo.some(f => coverageMatrix[d][f] === 1);
            if (isCovered) coveredWeight += weights[d];
        }

        if (coveredWeight > bestCoverage) {
            bestCoverage = coveredWeight;
            bestFacilities = combo;
        }
    }

    const assignments: DemandAssigment[] = [];

    for (let d = 0; d < nDemands; d++) {
        let assigned = -1;
        for (const f of bestFacilities) {
            if (coverageMatrix[d][f] === 1) {
                assigned = f;
                break;
            }
        }
        assignments.push({
            client: d,
            facility: assigned,
            cost: assigned === -1 ? Infinity : 0
        });
    }

    return {
        bestCost: bestCoverage,
        bestFacilities,
        assignments
    };
};
