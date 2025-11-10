import { useClientStore } from "@/store/useClientStore";
import { useFacilityStore } from "@/store/useFacilityStore";
import { NodeType } from "@/types/enums/nodeType.enum";
import { FacilityNode, GraphNode } from "@/types/nodes";

type ItemProps = {
    item: GraphNode;
    onRemove?: (node: GraphNode) => void;
    type: NodeType;
    permitSelection?: boolean;
    className?: string;
    cost?: number;
};

const Item = ({ item, onRemove, type, permitSelection, className, cost }: ItemProps) => {
    const { selectedFacility, selectFacility, clearFacilitySelection } = useFacilityStore();
    const { selectedClient, selectClient, clearClientSelection } = useClientStore();

    const handleClick = () => {
        if (type === NodeType.FACILITY && permitSelection) {
            if (selectedFacility?.id === item.id) {
                clearFacilitySelection();
            } else {
                selectFacility(item as FacilityNode);
            }
        } else if (type === NodeType.CLIENT && permitSelection) {
            if (selectedClient?.id === item.id) {
                clearClientSelection();
            } else {
                selectClient(item);
            }
        }
    };

    const showCost = cost !== undefined && cost !== null && cost >= 0;

    return (
        <div className="flex flex-col items-center">
            <div
                onClick={handleClick}
                className={`
                    flex items-center justify-center
                    w-16 h-16
                    bg-zinc-700
                    rounded-lg shadow-sm
                    font-medium text-center
                    select-none relative transition 
                    ${permitSelection
                        ? "transition-colors duration-200 cursor-pointer hover:bg-zinc-600"
                        : "cursor-default"
                    }
                    ${type === NodeType.FACILITY && selectedFacility?.id === item.id && permitSelection ? "ring-2 ring-white-500" : ""}
                    ${type === NodeType.CLIENT && selectedClient?.id === item.id && permitSelection ? "ring-2 ring-white-800" : ""}
                    ${className ?? ""}
                `}
            >
                {onRemove && (
                    <span
                        className="absolute top-1 left-1 text-red-500 text-xs hover:text-red-400 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item);
                        }}
                    >
                        ✕
                    </span>
                )}
                {item.value}
            </div>

            {showCost && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    role="text"
                    aria-label="cost"
                    className="mt-1 text-xs font-medium text-amber-300 bg-neutral-800 border border-neutral-700 rounded-md px-2 py-0.5 shadow-sm"
                >
                    {cost.toFixed(2)}
                </div>
            )}
        </div>
    );
};

export default Item;