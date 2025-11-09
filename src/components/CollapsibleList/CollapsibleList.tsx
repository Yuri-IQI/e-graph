import { useState } from "react";
import { NodeType } from "@/types/enums/nodeType.enum";
import { GraphNode } from "@/types/nodes";
import Item from "../Item/Item";

type CollapsibleListProps = {
    title: string;
    type: NodeType;
    items: GraphNode[];
    facilityLimit?: number;
    createItem: (node: GraphNode, type: NodeType) => void;
    removeItem: (node: GraphNode, type: NodeType) => void;
};

const CollapsibleList = ({
    title,
    type,
    items,
    facilityLimit,
    createItem,
    removeItem,
}: CollapsibleListProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newValue, setNewValue] = useState("");

    const handleStartCreate = () => {
        setIsEditing(true);
        setNewValue("");
    };

    const handleSubmitNewItem = () => {
        const trimmed = newValue.trim();
        if (!trimmed) {
            setIsEditing(false);
            return;
        }

        const newItem: GraphNode = {
            id: items[items.length - 1]?.id + 1 || 1,
            value: trimmed,
        };

        createItem(newItem, type);
        setIsEditing(false);
        setNewValue("");
    };

    const handleRemoveItem = (node: GraphNode) => {
        removeItem(node, type);
    };

    return (
        <div className="w-full bg-neutral-800 text-white border-l border-neutral-700 rounded-xl shadow-md">
            <div
                className="flex items-center justify-between p-4 cursor-pointer select-none"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span className="font-semibold text-lg">{title}</span>
                <span className="text-xl transition-transform duration-200">
                    {isOpen ? "▾" : "▸"}
                </span>
            </div>

            <div
                className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="flex flex-wrap justify-start items-center gap-3 p-3">
                    {items.map((item) => (
                        <Item
                            key={item.id}
                            item={item}
                            onRemove={handleRemoveItem}
                            type={type}
                            permitSelection={type === NodeType.FACILITY}
                            className={type === NodeType.FACILITY && items.indexOf(item) >= facilityLimit! ? "text-red-500" : ""}
                        />
                    ))}

                    {((type === NodeType.FACILITY && items.length <= ((facilityLimit! ?? Infinity) - 1)) || (type === NodeType.CLIENT)) && (
                        <div className="
                            w-16 h-16 flex items-center justify-center
                            border border-green-500 bg-zinc-700 rounded-lg 
                            hover:bg-zinc-600 cursor-pointer transition
                        ">
                            {isEditing ? (
                                <input
                                    type="text"
                                    autoFocus
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    onBlur={handleSubmitNewItem}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSubmitNewItem();
                                        if (e.key === "Escape") setIsEditing(false);
                                    }}
                                    className="w-full h-full bg-transparent text-white text-center focus:outline-none placeholder-gray-400"
                                />
                            ) : (
                                <span
                                    onClick={handleStartCreate}
                                    className="text-gray-300 font-medium select-none"
                                >
                                    Add +
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CollapsibleList;