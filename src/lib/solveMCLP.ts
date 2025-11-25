import { DemandAssigment, SolutionSet } from "@/types/assignment";
import { getCombinations } from "./common";

import { CoverageNode, CoverageDemand } from "@/types/nodes";

export const buildCoverageMatrix = (
    facilities: CoverageNode[],
    demands: CoverageDemand[],
    radius: number
): number[][] => {
    if (!facilities.length || !demands.length) {
        console.warn("Empty facilities or demands in buildCoverageMatrix", { facilities, demands, radius });
    }

    return demands.map(d =>
        facilities.map(f => {
            if (d.posX == null || d.posY == null || f.posX == null || f.posY == null)
                return 0;

            const dist = Math.sqrt(
                (d.posX - f.posX) ** 2 +
                (d.posY - f.posY) ** 2
            );

            return dist <= radius ? 1 : 0;
        })
    );
};

export const autoAllocate = (
    demands: CoverageDemand[],
    radius: number
): {
    perDemandMap: Record<number, [{ x: number; y: number }, number]>;
    bestPositions: { x: number; y: number }[];
} => {

    const valid = demands.filter(
        d => d.posX != null && d.posY != null
    );

    if (valid.length < 2) {
        return { perDemandMap: {}, bestPositions: [] };
    }

    const perDemandMap: Record<number, [{ x: number; y: number }, number]> = {};
    const scored: { x: number; y: number; count: number }[] = [];

    for (let i = 0; i < valid.length; i++) {
        for (let j = i + 1; j < valid.length; j++) {

            const A = valid[i];
            const B = valid[j];

            const ax = A.posX!, ay = A.posY!;
            const bx = B.posX!, by = B.posY!;

            const midX = (ax + bx) / 2;
            const midY = (ay + by) / 2;

            const coverageRadius = radius;

            let count = 0;

            for (const other of valid) {
                const ox = other.posX!;
                const oy = other.posY!;

                const dx2 = ox - midX;
                const dy2 = oy - midY;
                const distToMid = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                if (distToMid <= coverageRadius) {
                    count++;
                }
            }

            scored.push({ x: midX, y: midY, count });
        }
    }

    scored.sort((a, b) => b.count - a.count);

    const bestPositions = scored.map(s => ({ x: s.x, y: s.y }));

    for (const d of valid) {
        perDemandMap[d.id] = [
            {
                x: bestPositions[0].x,
                y: bestPositions[0].y
            },
            scored[0].count
        ];
    }

    return {
        perDemandMap,
        bestPositions
    };
};

export const solveMCLP = (
    coverageMatrix: number[][],
    p: number
): SolutionSet => {

    const nDemands = coverageMatrix.length;
    const nFacilities = coverageMatrix[0].length;

    const facilityIds = [...Array(nFacilities).keys()];

    let bestCoverage = -1;
    let bestFacilities: number[] = [];

    for (const combo of getCombinations(facilityIds, p)) {
        let coveredCount = 0;

        for (let d = 0; d < nDemands; d++) {
            const isCovered = combo.some(f => coverageMatrix[d][f] === 1);
            if (isCovered) coveredCount += 1;
        }

        if (coveredCount > bestCoverage) {
            bestCoverage = coveredCount;
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
            cost: assigned === -1 ? 0 : 1
        });
    }

    return {
        bestCost: bestCoverage,
        bestFacilities,
        assignments
    };
};