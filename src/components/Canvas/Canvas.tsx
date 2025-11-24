"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Stage, Layer, Circle, Text, Group, Line } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

import { useCanvasActionStore, ActionEnum } from "@/store/useCanvasActionStore";
import { ClientUnion, useClientStore } from "@/store/useClientStore";
import { useFacilityStore } from "@/store/useFacilityStore";
import { useShapeStore } from "@/store/useShapeStore";

import { NodeType } from "@/types/enums/nodeType.enum";
import { CoverageDemand, CoverageNode, GraphNode } from "@/types/nodes";
import { Shape } from "@/types/geometries/shape";
import { DemandAssigment, SolutionSet } from "@/types/assignment";
import { autoAllocateByPairwiseMidpoints } from "@/lib/solveMCLP";

interface CanvasProps {
    radius: number;
    solution?: SolutionSet | null;
}

const Canvas: React.FC<CanvasProps> = ({ radius, solution }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 800, height: 600 });

    const { activeAction, clearActionSelection } = useCanvasActionStore();
    const { shapes, addShape, updateShape, delShape } = useShapeStore();

    const updateNodeInStore = useCallback(
        (nodeType: NodeType, node: GraphNode, posX: number | null, posY: number | null) => {
            if (nodeType === NodeType.CLIENT) {
                const updated: CoverageDemand = {
                    ...(node as CoverageNode),
                    posX,
                    posY,
                    isPlaced: posX !== null,
                    cost: (node as CoverageDemand).cost ?? 0
                };
                useClientStore.getState().updateClient(updated);
            } else if (nodeType === NodeType.FACILITY) {
                const updated: CoverageNode = {
                    ...(node as CoverageNode),
                    posX,
                    posY,
                    isPlaced: posX !== null
                };
                useFacilityStore.getState().updateFacility(updated);
            }
        },
        []
    );

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

    useEffect(() => {
        if (activeAction !== ActionEnum.AUTO_ALLOCATE) return;

        const handleAutoAllocateFacilities = () => {
            const { clientNodes } = useClientStore.getState();

            const demandCoverages = clientNodes.filter(
                (node): node is ClientUnion & { posX: number; posY: number } =>
                    "posX" in node && "posY" in node
            );

            if (demandCoverages.length === 0) {
                console.warn("No demand nodes with coordinates for auto-allocation.");
                return;
            }

            if (!demandCoverages) return;

            if (!demandCoverages.length) {
                console.warn("No demand nodes for auto-allocate.");
                return;
            }

            const { bestPositions } =
                autoAllocateByPairwiseMidpoints(demandCoverages, radius);

            if (!bestPositions.length) {
                console.warn("Auto allocation returned no positions.");
                return;
            }

            const facilities = useFacilityStore.getState().facilityNodes;
            const moveCount = Math.min(facilities.length, bestPositions.length);

            for (let i = 0; i < moveCount; i++) {
                const f = facilities[i];
                const pos = bestPositions[i];

                useFacilityStore.getState().updateFacility({
                    ...f,
                    posX: pos.x,
                    posY: pos.y,
                    isPlaced: true
                });

                const shape = useShapeStore
                    .getState()
                    .shapes.find(s => s.nodeId === f.id && s.nodeType === NodeType.FACILITY);

                if (shape) {
                    useShapeStore.getState().updateShape(shape.shapeId, {
                        x: pos.x,
                        y: pos.y
                    });
                }
            }
        };

        handleAutoAllocateFacilities();
        clearActionSelection();
    }, [activeAction, clearActionSelection, radius]);

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
        const type = isClient ? NodeType.CLIENT : NodeType.FACILITY;

        if (hasShapeForNode(selectedNode.id, type)) return;

        addShape({
            shapeId: shapes[shapes.length - 1]?.shapeId + 1 || 0,
            nodeId: selectedNode.id,
            nodeType: type,
            x: pointer.x,
            y: pointer.y
        });

        updateNodeInStore(type, selectedNode, pointer.x, pointer.y);
    };

    const handleDragMove = (s: Shape) => (e: KonvaEventObject<DragEvent>) => {
        const { x, y } = e.target.position();
        updateShape(s.shapeId, { x, y });

        const storeNode =
            s.nodeType === NodeType.CLIENT
                ? useClientStore.getState().clientNodes.find((c) => c.id === s.nodeId)
                : useFacilityStore.getState().facilityNodes.find((f) => f.id === s.nodeId);

        if (storeNode) updateNodeInStore(s.nodeType, storeNode, x, y);
    };

    const handleNodeDelete = (s: Shape) => (e: KonvaEventObject<MouseEvent>) => {
        if (!e.evt.shiftKey) return;

        delShape(s.shapeId);

        const storeNode =
            s.nodeType === NodeType.CLIENT
                ? useClientStore.getState().clientNodes.find((c) => c.id === s.nodeId)
                : useFacilityStore.getState().facilityNodes.find((f) => f.id === s.nodeId);

        if (storeNode) updateNodeInStore(s.nodeType, storeNode, null, null);
    };

    const getNodeData = (s: Shape) => {
        return s.nodeType === NodeType.CLIENT
            ? useClientStore.getState().clientNodes.find((c) => c.id === s.nodeId)
            : useFacilityStore.getState().facilityNodes.find((f) => f.id === s.nodeId);
    };

    const assignmentLines = useMemo(() => {
        if (!solution) return [];

        const { assignments } = solution;

        return assignments
            .map((a: DemandAssigment) => {
                const facilityShape = shapes.find(
                    (s) => s.nodeId === a.facility && s.nodeType === NodeType.FACILITY
                );
                const clientShape = shapes.find(
                    (s) => s.nodeId === a.client && s.nodeType === NodeType.CLIENT
                );

                if (!facilityShape || !clientShape) return null;

                return {
                    id: `line-${a.client}-${a.facility}`,
                    points: [clientShape.x, clientShape.y, facilityShape.x, facilityShape.y]
                };
            })
            .filter(Boolean) as { id: string; points: number[] }[];
    }, [solution, shapes]);

    return (
        <div
            ref={containerRef}
            className="bg-black border-2 border-white rounded-xl overflow-hidden"
        >
            <Stage
                width={size.width}
                height={size.height}
                onMouseDown={handleCanvasClick}
                className="bg-neutral-900"
            >
                <Layer>
                    {assignmentLines.map((line) => (
                        <Line
                            key={line.id}
                            points={line.points}
                            stroke="#dd9f9faa"
                            strokeWidth={2}
                            lineCap="round"
                            lineJoin="round"
                        />
                    ))}
                </Layer>

                <Layer>
                    {shapes.map((s) => {
                        const node = getNodeData(s);
                        if (!node) return null;

                        const isFacility = s.nodeType === NodeType.FACILITY;

                        return (
                            <Group
                                key={s.shapeId}
                                x={s.x}
                                y={s.y}
                                draggable
                                onDragMove={handleDragMove(s)}
                                onClick={handleNodeDelete(s)}
                                onContextMenu={handleNodeDelete(s)}
                            >
                                {isFacility && radius > 0 && (
                                    <Circle
                                        radius={radius}
                                        fill="rgba(156,146,126,0.23)"
                                        stroke="rgba(214,193,193,0.4)"
                                        strokeWidth={2}
                                        listening={false}
                                    />
                                )}

                                <Circle
                                    radius={10}
                                    fill={s.nodeType === NodeType.CLIENT
                                        ? "#6c839bff"
                                        : node.isPlaced
                                            ? "#90bd78ff"
                                            : "#999677ff"
                                    }
                                    stroke="#ffffff"
                                />

                                <Text
                                    text={`(${node.id})`}
                                    fontSize={10}
                                    fill="#e9e9e9ff"
                                    offsetY={25}
                                    offsetX={23}
                                />

                                <Text
                                    text={`${node.value}`}
                                    fontSize={16}
                                    fill="#e9e9e9ff"
                                    offsetY={28}
                                    offsetX={-13}
                                />
                            </Group>
                        );
                    })}
                </Layer>
            </Stage>
        </div>
    );
};

export default Canvas;