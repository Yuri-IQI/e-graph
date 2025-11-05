import { GraphNode } from "@/types/nodes";
import Item from "../Item/Item";
import { NodeType } from "@/types/enums/nodeType.enum";

type NodeContainerProps = {
    nodes: GraphNode[] | undefined,
    type: NodeType
}

const NodeContainer = ({ nodes, type }: NodeContainerProps) => {
    return (
        <div>
            {nodes && nodes.map(n => (
                <Item key={n.id} item={n} type={type} />
            ))}
        </div>
    );
}

export default NodeContainer;