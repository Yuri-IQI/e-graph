import { useClientStore } from "@/store/useClientStore";
import { useFacilityStore } from "@/store/useFacilityStore";
import { NodeType } from "@/types/enums/nodeType.enum";
import { FacilityNode, GraphNode } from "@/types/nodes";

type ItemProps = {
  item: GraphNode;
  onRemove?: (node: GraphNode) => void;
  type: NodeType;
};

const Item = ({ item, onRemove, type }: ItemProps) => {
    const { selectedFacility, selectFacility, clearFacilitySelection } = useFacilityStore();
    const { selectedClient, selectClient, clearClientSelection } = useClientStore();

    return (
        <div
            onDoubleClick={() => onRemove && onRemove(item)}
            onClick={type === NodeType.FACILITY 
                ? () => (selectedFacility?.id === item.id 
                    ? clearFacilitySelection()
                    : selectFacility(item as FacilityNode)) 
                : () => (selectedClient?.id === item.id)
                    ? clearClientSelection()
                    : selectClient(item)}
            className={`
                flex items-center justify-center
                w-16 h-16
                bg-zinc-700 hover:bg-zinc-600
                rounded-lg shadow-sm
                font-medium text-center
                transition cursor-pointer
                select-none
                ${type === NodeType.FACILITY && selectedFacility?.id === item.id ? "ring-2 ring-blue-500" : ""}
            `}
        >
            {item.value}
        </div>
    );
};

export default Item;