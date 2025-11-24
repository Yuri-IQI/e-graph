"use client";

import { useEffect, useMemo, useState } from "react";
import { NodeType } from "@/types/enums/nodeType.enum";
import { GraphNode, FacilityDemand, FacilityNode } from "@/types/nodes";
import { Shape } from "@/types/geometries/shape";

import Item from "../Item/Item";
import { useShapeStore } from "@/store/useShapeStore";
import { useFacilityStore } from "@/store/useFacilityStore";
import NodeCostEditor from "../NodeCostEditor/NodeCostEditor";
import { Formulation } from "@/types/enums/formulation.enum";

type Props = {
    title: string;
    type: NodeType;
    items: GraphNode[];
    facilityLimit?: number;
    createItem: (node: GraphNode, type: NodeType) => void;
    removeItem: (node: GraphNode, type: NodeType) => void;
    handleCostSubmit?: (clientId: number, val: string) => void;
    formulation: Formulation;
};

const CollapsibleList = ({
    title,
    type,
    items,
    createItem,
    removeItem,
    handleCostSubmit,
    formulation
}: Props) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newValue, setNewValue] = useState("");

    const { shapes, delShape } = useShapeStore();
    const { selectedFacility } = useFacilityStore();


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
            id: items[items.length - 1]?.id + 1 || 0,
            isPlaced: false,
            value: trimmed
        };

        createItem(newItem, type);
        setIsEditing(false);
        setNewValue("");
    };

    const handleRemoveItem = (node: GraphNode) => {
        const nodeShape: Shape | undefined = shapes.find(
            (shape) => shape.nodeId === node.id && shape.nodeType === type
        );

        if (nodeShape) delShape(nodeShape.shapeId);

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
                className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="flex flex-wrap justify-start items-start gap-3 p-3">
                    {items.map((item) => {
                        const isDemand = handleCostSubmit !== undefined;

                        let n: FacilityDemand | undefined;

                        if (
                            isDemand &&
                            selectedFacility &&
                            (selectedFacility as FacilityNode).demand
                        ) {
                            const facility = selectedFacility as FacilityNode;
                            n = facility.demand.find(d => d.id === item.id);
                        }

                        return (
                            <div key={item.id} className="flex flex-col items-center">
                                <Item
                                    item={item}
                                    type={type}
                                    onRemove={handleRemoveItem}
                                    permitSelection={true}
                                />

                                {selectedFacility &&
                                    isDemand &&
                                    formulation === Formulation.PMEDIAN &&
                                    type === NodeType.CLIENT &&
                                    n && (
                                        <NodeCostEditor
                                            key={`editor-${n.id}`}
                                            node={n}
                                            handleCostSubmit={handleCostSubmit}
                                        />
                                    )}
                            </div>
                        );
                    })}

                    <div
                        className="
                            w-16 h-16 flex items-center justify-center
                            border border-green-500 bg-zinc-700 rounded-lg 
                            hover:bg-zinc-600 cursor-pointer transition
                        "
                    >
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
                                className="w-full h-full bg-transparent text-white text-center 
                                           focus:outline-none placeholder-gray-400"
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
                </div>
            </div>
        </div>
    );
};

export default CollapsibleList;