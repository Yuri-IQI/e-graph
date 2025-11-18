import { FacilityNode, GraphNode } from "@/types/nodes";
import AssignmentDisplay from "../AssignmentDisplay/AssignmentDisplay";

type Props = {
    bestCost: number,
    bestFacilities: number[],
    facilityNodes: FacilityNode[],
    clientNodes: GraphNode[],
    assignments: {
        client: number,
        facility: number,
        cost: number
    }[]
}

const ResultDisplay = ({ bestCost, bestFacilities, facilityNodes, clientNodes, assignments }: Props) => {
    return (
        <section className="flex w-full flex-col max-w-5xl p-4 mt-4 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-white">Solution Result</h1>

            <div className="flex flex-col sm:flex-row sm:justify-between bg-neutral-800 rounded-xl p-4 mb-4 border border-neutral-700">
              <div>
                <p className="mb-1">
                  <span className="font-medium text-gray-300">Total Cost:</span>{" "}
                  <span className="text-amber-300 font-semibold">{bestCost}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-300">Opened Facilities:</span>{" "}
                  <span className="text-amber-300">{bestFacilities.map(bf => facilityNodes.find(f => f.id === bf)?.value).join(", ")}</span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Assignments</h2>
              <AssignmentDisplay clientNodes={clientNodes} assignments={assignments} />
            </div>
        </section>
    );
};

export default ResultDisplay;