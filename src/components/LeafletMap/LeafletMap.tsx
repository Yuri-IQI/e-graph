// src/components/LeafletMap/LeafletMap.tsx
"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { LatLng } from "leaflet";

import { NodeType } from "@/types/enums/nodeType.enum";
import { Formulation } from "@/types/enums/formulation.enum";
import { DemandAssigment, SolutionSet } from "@/types/assignment";

import { useClientStore } from "@/store/useClientStore";
import { useFacilityStore } from "@/store/useFacilityStore";
import { useShapeStore } from "@/store/useShapeStore";
import { useCanvasActionStore, ActionEnum } from "@/store/useCanvasActionStore";

import {
  isCoverageDemand,
  isCoverageNode,
  CoverageNode,
  CoverageDemand,
} from "@/types/nodes";

import { Shape } from "@/types/geometries/shape";
import { autoAllocateByPairwiseMidpoints } from "@/lib/solveMCLP";

delete (L.Icon.Default.prototype as any)?._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.svg",
});

const clientIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon-red.svg",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const facilityIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon-green.svg",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LeafletMapProps {
  radiusMeters: number;
  formulation: Formulation;
  solution?: SolutionSet | null;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  radiusMeters,
  formulation,
  solution,
  defaultCenter = [-23.55, -46.63],
  defaultZoom = 14,
}) => {
  const { clientNodes, selectedClient, updateClient, clearClientSelection } =
    useClientStore();
  const {
    facilityNodes,
    selectedFacility,
    updateFacility,
    clearFacilitySelection,
  } = useFacilityStore();

  const { shapes, addShape, updateShape, hasShapeForNode } = useShapeStore();

  const { activeAction, clearActionSelection } = useCanvasActionStore();

  const updateNodeFromMap = useCallback(
    (nodeType: NodeType, nodeId: number, lng: number | null, lat: number | null) => {
      if (nodeType === NodeType.CLIENT) {
        const node = clientNodes.find((c) => c.id === nodeId);
        if (!node) return;

        const cost = isCoverageDemand(node) ? node.cost : (node as CoverageDemand).cost ?? 0;

        const updated: CoverageDemand = {
          ...node,
          posX: lng,
          posY: lat,
          isPlaced: lng !== null && lat !== null,
          cost,
        };

        updateClient(updated);
      } else {
        const node = facilityNodes.find((f) => f.id === nodeId);
        if (!node) return;

        const updated: CoverageNode = {
          ...node,
          posX: lng,
          posY: lat,
          isPlaced: lng !== null && lat !== null,
        };

        updateFacility(updated);
      }

      const shape = shapes.find((s) => s.nodeId === nodeId && s.nodeType === nodeType);
      if (shape) {
        updateShape(shape.shapeId, { x: lng ?? shape.x, y: lat ?? shape.y });
      }
    },
    [clientNodes, facilityNodes, shapes, updateClient, updateFacility, updateShape]
  );

  const MapClickHandler = () => {
    useMapEvents({
      click(e: L.LeafletMouseEvent) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (
          activeAction !== ActionEnum.POSITION_CLIENT &&
          activeAction !== ActionEnum.POSITION_FACILITY
        )
          return;

        const isClient = activeAction === ActionEnum.POSITION_CLIENT;
        const selected = isClient ? selectedClient : selectedFacility;
        if (!selected) return;

        if (hasShapeForNode(selected.id, isClient ? NodeType.CLIENT : NodeType.FACILITY)) {
          updateNodeFromMap(isClient ? NodeType.CLIENT : NodeType.FACILITY, selected.id, lng, lat);
        } else {
          const newShapeId = shapes.length ? shapes[shapes.length - 1].shapeId + 1 : 0;
          const nodeType = isClient ? NodeType.CLIENT : NodeType.FACILITY;

          addShape({
            shapeId: newShapeId,
            nodeId: selected.id,
            nodeType,
            x: lng,
            y: lat,
          } as Shape);

          updateNodeFromMap(nodeType, selected.id, lng, lat);
        }

        if (isClient) clearClientSelection();
        else clearFacilitySelection();

        clearActionSelection();
      },
    });

    return null;
  };

  const makeDragEndHandler =
    (nodeId: number, nodeType: NodeType) => (ev: L.DragEndEvent) => {
      const latlng: LatLng = ev.target.getLatLng();
      updateNodeFromMap(nodeType, nodeId, latlng.lng, latlng.lat);
    };

  useEffect(() => {
    if (activeAction !== ActionEnum.AUTO_ALLOCATE) return;

    const clients = useClientStore.getState().clientNodes;

    const demandCoverages = clients.filter(
      (node): node is CoverageDemand & { posX: number; posY: number } =>
        "posX" in node && "posY" in node
    );

    if (!demandCoverages.length) {
      console.warn("No demand nodes with coordinates for auto-allocation.");
      clearActionSelection();
      return;
    }

    const { bestPositions } = autoAllocateByPairwiseMidpoints(demandCoverages, radiusMeters);

    const facilities = useFacilityStore.getState().facilityNodes;
    const count = Math.min(facilities.length, bestPositions.length);

    for (let i = 0; i < count; i++) {
      const f = facilities[i];
      const pos = bestPositions[i];

      updateNodeFromMap(NodeType.FACILITY, f.id, pos.x, pos.y);
    }

    clearActionSelection();
  }, [activeAction, radiusMeters, updateNodeFromMap, clearActionSelection]);

  const assignmentLines = useMemo(() => {
    if (!solution) return [];

    return solution.assignments
      .map((a: DemandAssigment) => {
        const clientShape = shapes.find((s) => s.nodeId === a.client && s.nodeType === NodeType.CLIENT);
        const facilityShape = shapes.find((s) => s.nodeId === a.facility && s.nodeType === NodeType.FACILITY);

        if (!clientShape || !facilityShape) return null;

        return {
          id: `ln-${a.client}-${a.facility}`,
          points: [
            [clientShape.y, clientShape.x] as [number, number],
            [facilityShape.y, facilityShape.x] as [number, number],
          ],
        };
      })
      .filter(Boolean) as { id: string; points: [number, number][] }[];
  }, [solution, shapes]);

  if (formulation !== Formulation.MCLP) return null;

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-600 shadow-lg">
      <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ width: "100%", height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapClickHandler />

        {assignmentLines.map((line) => (
          <Polyline key={line.id} positions={line.points} pathOptions={{ color: "#dd9f9f", weight: 2, opacity: 0.9 }} />
        ))}

        {shapes
          .filter((s) => s.nodeType === NodeType.CLIENT)
          .map((s) => {
            const node = clientNodes.find((c) => c.id === s.nodeId);
            return (
              <Marker
                key={`client-${s.shapeId}`}
                icon={clientIcon}
                position={[s.y, s.x]}
                draggable
                eventHandlers={{ dragend: makeDragEndHandler(s.nodeId, NodeType.CLIENT) }}
              >
                {node && isCoverageDemand(node) && (
                  <></>
                )}
              </Marker>
            );
          })}

        {shapes
          .filter((s) => s.nodeType === NodeType.FACILITY)
          .map((s) => {
            const node = facilityNodes.find((f) => f.id === s.nodeId);
            return (
              <React.Fragment key={`facility-${s.shapeId}`}>
                <Marker
                  position={[s.y, s.x]}
                  icon={facilityIcon}
                  draggable
                  eventHandlers={{ dragend: makeDragEndHandler(s.nodeId, NodeType.FACILITY) }}
                />

                <Circle
                  center={[s.y, s.x]}
                  radius={radiusMeters}
                  pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.12, weight: 2 }}
                />
              </React.Fragment>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;