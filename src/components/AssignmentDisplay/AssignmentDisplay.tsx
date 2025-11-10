import { useFacilityStore } from "@/store/useFacilityStore";
import { DemandAssigment } from "@/types/assignment";
import { NodeType } from "@/types/enums/nodeType.enum";
import { FacilityDemand, FacilityNode, GraphNode } from "@/types/nodes";
import Item from "../Item/Item";

type AssignmentDisplayProps = {
    clientNodes: GraphNode[];
    assignments: DemandAssigment[];
};

const AssignmentDisplay = ({ assignments, clientNodes }: AssignmentDisplayProps) => {
    const { facilityNodes } = useFacilityStore();

    const assignedFacilities = new Set(assignments.map(a => a.facility));

    const heads: FacilityNode[] = facilityNodes
        .filter(f => assignedFacilities.has(f.id))
        .map(f => ({ ...f, demand: [] }));

    const assignees: FacilityDemand[] = clientNodes
        .map((c) => {
            const a = assignments.find((x) => x.client === c.id);
            return a ? { ...c, cost: a.cost } : null;
        })
        .filter((a): a is FacilityDemand => Boolean(a));

    assignments.forEach((a) => {
        const head = heads.find((h) => h.id === a.facility);
        const demand = assignees.find((d) => d.id === a.client);
        if (head && demand) head.demand.push(demand);
    });

    if (!heads.length) {
        return <p className="text-gray-400 italic">No assignments found.</p>;
    }

    return (
        <div className="flex flex-col w-full bg-neutral-900 border border-neutral-700 rounded-2xl shadow-md p-4">
            {heads.map((head, index) => (
                <div
                    key={head.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 ${
                        index !== heads.length - 1 ? "border-b border-neutral-700" : ""
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Item item={head} type={NodeType.FACILITY} />
                        <span className="text-xs text-gray-400 self-start">({head.id})</span>
                        <span className="text-gray-400">:</span>
                    </div>

                    {head.demand.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                            {head.demand.map((client) => (
                                <div key={client.id} className="flex items-center gap-1">
                                    <Item
                                        item={client}
                                        type={NodeType.CLIENT}
                                        cost={client.cost}
                                    />
                                    <span className="text-xs text-gray-400 self-start">({client.id})</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-gray-500 text-sm">—</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AssignmentDisplay;