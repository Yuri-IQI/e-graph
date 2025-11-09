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
};

const Item = ({ item, onRemove, type, permitSelection, className }: ItemProps) => {
    const { selectedFacility, selectFacility, clearFacilitySelection } = useFacilityStore();
    const { selectedClient, selectClient, clearClientSelection } = useClientStore();

    const handleClick = () => {
        if (type === NodeType.FACILITY) {
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

    return (
        <div
            onClick={handleClick}
            className={`
                flex items-center justify-center
                w-16 h-16
                bg-zinc-700
                rounded-lg shadow-sm
                font-medium text-center
                transition ${permitSelection ? "cursor-pointer hover:bg-zinc-600" : "cursor-default"}
                select-none
                relative
                ${type === NodeType.FACILITY && selectedFacility?.id === item.id ? "ring-2 ring-blue-500" : ""}
                ${type === NodeType.CLIENT && selectedClient?.id === item.id ? "ring-2 ring-blue-500" : ""}
            ` + (className ? ` ${className}` : "")}
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
    );
};

export default Item;