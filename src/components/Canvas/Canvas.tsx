"use client";

import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Circle } from "react-konva";
import { useCanvasActionStore, ActionEnum } from "@/store/useCanvasActionStore";

import { KonvaEventObject } from "konva/lib/Node";
import { useClientStore } from "@/store/useClientStore";
import { useFacilityStore } from "@/store/useFacilityStore";
import { useShapeStore } from "@/store/useShapeStore";
import { NodeType } from "@/types/enums/nodeType.enum";
import { CoverageDemand, CoverageNode, GraphNode } from "@/types/nodes";

const Canvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 800, height: 600 });

    const { activeAction } = useCanvasActionStore();
    const { shapes, addShape } = useShapeStore();

    useEffect(() => {
        const update = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setSize({ width: rect.width, height: rect.height });
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
        if (
            activeAction !== ActionEnum.POSITION_CLIENT &&
            activeAction !== ActionEnum.POSITION_FACILITY
        ) {
            return;
        }

        const stage = e.target.getStage();
        const pointer = stage?.getPointerPosition();
        if (!pointer) return;

        const isClient = activeAction === ActionEnum.POSITION_CLIENT;

        const selectedNode = isClient
            ? useClientStore.getState().selectedClient
            : useFacilityStore.getState().selectedFacility;

        if (!selectedNode) return;

        const { hasShapeForNode } = useShapeStore.getState();
        const selectedNodeType = isClient ? NodeType.CLIENT : NodeType.FACILITY; 

        if (hasShapeForNode(selectedNode.id, selectedNodeType)) {
            console.warn("Node already positioned!", selectedNode);
            return;
        }

        useShapeStore.getState().addShape({
            nodeId: selectedNode.id,
            nodeType: isClient ? NodeType.CLIENT : NodeType.FACILITY,
            x: pointer.x,
            y: pointer.y,
        });

        updateNode(selectedNodeType, selectedNode, pointer.x, pointer.y);
    };

    const updateNode = (nodeType: NodeType, node: GraphNode, posX: number, posY: number) => {
        if (nodeType === NodeType.CLIENT) {
            const newNode: CoverageDemand = {
                ...node,
                posX: posX,
                posY: posY,
                isPlaced: true,
                weight: 0
            }

            useClientStore.getState().updateClient(newNode);
        } else if (NodeType.FACILITY) {
            const newNode: CoverageNode = {
                ...node,
                posX: posX,
                posY: posY,
                isPlaced: true
            }

            useFacilityStore.getState().updateFacility(newNode);
        }
    }

    return (
        <div
            ref={containerRef}
            style={{
                left: `10vw`,
                top: `10vh`,
                width: `80vw`,
                height: `70vh`,
                background: "#f3f4f6",
                borderRadius: "12px",
                overflow: "hidden",
            }}
        >
            <Stage
                width={size.width}
                height={size.height}
                onMouseDown={handleCanvasClick}
                style={{ background: "white" }}
            >
                <Layer>
                    {shapes.map((s) => (
                        <Circle
                            key={s.nodeId}
                            x={s.x}
                            y={s.y}
                            radius={10}
                            fill={s.nodeType === NodeType.CLIENT ? "#60a5fa" : "#4ade80"}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};

export default Canvas;