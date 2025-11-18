import { Formulation } from "@/types/enums/formulation.enum";
import { CoverageDemand, CoverageNode, FacilityNode } from "@/types/nodes";
import { buildCostMatrix, extractClientWeights, solvePMedian } from "./solvePMedian";
import { buildCoverageMatrix, solveMCLP } from "./solveMCLP";
import { SolutionSet } from "@/types/assignment";

export const getCombinations = <T>(arr: T[], p: number): T[][] => {
    if (p === 0) return [[]];
    if (arr.length === 0) return [];
    const [first, ...rest] = arr;

    return [
        ...getCombinations(rest, p - 1).map(c => [first, ...c]),
        ...getCombinations(rest, p),
    ];
};

export const solveLocationProblem = ({
    type,
    facilitiesPM,
    facilitiesMC,
    demandsMC,
    radius,
    p
}: {
    type: Formulation;
    facilitiesPM?: FacilityNode[];
    facilitiesMC?: CoverageNode[];
    demandsMC?: CoverageDemand[];
    radius?: number;
    p: number;
}): SolutionSet | null => {

    if (type === Formulation.PMEDIAN) {
        if (!facilitiesPM || !facilitiesPM.length) return null;
        return solvePMedian(
            buildCostMatrix(facilitiesPM)!,
            p,
            extractClientWeights(facilitiesPM)!
        );
    }

    if (type === Formulation.MCLP) {
        if (!facilitiesMC || !demandsMC) return null;

        const coverageMatrix = buildCoverageMatrix(
            facilitiesMC,
            demandsMC,
            radius!
        );
        const weights = demandsMC.map(d => d.weight);

        return solveMCLP(coverageMatrix, weights, p);
    }

    console.warn(`[solveLocationProblem] Unknown type`, type);
    return null;
};