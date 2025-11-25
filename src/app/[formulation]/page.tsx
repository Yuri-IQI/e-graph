"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Formulation } from "@/types/enums/formulation.enum";
import { NodeType } from "@/types/enums/nodeType.enum";
import { CoverageDemand, CoverageNode, FacilityDemand, FacilityNode, GraphNode } from "@/types/nodes";
import CollapsibleList from "@/components/CollapsibleList/CollapsibleList";
import OptionButton from "@/components/OptionButton/OptionButton";
import { useFacilityStore } from "@/store/useFacilityStore";
import { useSyncFacilityDemands } from "@/hooks/useSyncFacilityDemands";
import Canvas from "@/components/Canvas/Canvas";
import ResultDisplay from "@/components/ResultDisplay/ResultDisplay";
import CanvasButton from "@/components/CanvasButton/CanvasButton";
import { ActionEnum, useCanvasActionStore } from "@/store/useCanvasActionStore";
import { useClientStore } from "@/store/useClientStore";
import { SolutionSet } from "@/types/assignment";
import { solveLocationProblem } from "@/lib/common";
import Header from "@/components/Header/Header";
import { useShapeStore } from "@/store/useShapeStore";
import dynamic from "next/dynamic";
import { useMapDisplayStore } from "@/store/useMapDisplayStore";

const LeafletMap = dynamic(
  () => import("@/components/LeafletMap/LeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center border border-gray-600 rounded-lg">
        <div className="text-white text-lg">Loading map...</div>
      </div>
    )
  }
);

const FormulationPage = () => {
  const searchParams = useSearchParams();
  const type = useMemo(
    () => (searchParams.get("type") as Formulation | null),
    [searchParams]
  );

  const [facilityLimit, setFacilityLimit] = useState(1);
  const [coverageRange, setCoverageRange] = useState(0);

  const [result, setResult] = useState<SolutionSet | null>(null);

  const { isShowing } = useMapDisplayStore();

  const {
    clientNodes,
    addClient,
    removeClient
  } = useClientStore();

  const {
    facilityNodes,
    addFacility,
    removeFacility,
    selectedFacility,
    updateFacility
  } = useFacilityStore();

  const { selectAction } = useCanvasActionStore();

  useSyncFacilityDemands(clientNodes);

  const addNode = useCallback((node: GraphNode, nodeType: NodeType) => {
    if (nodeType === NodeType.CLIENT) {
      if (type === Formulation.MCLP) {
        const coverageClient: CoverageDemand = {
          ...node,
          cost: 0,
          posX: null,
          posY: null,
          isPlaced: false
        };
        addClient(coverageClient);
      } else {
        addClient(node as FacilityDemand);
      }
    } else {
      if (type === Formulation.MCLP) {
        const newFacility: CoverageNode = {
          ...node,
          isPlaced: false,
          posX: null,
          posY: null
        };
        addFacility(newFacility);
      } else {
        const newFacility: FacilityNode = { ...node, isPlaced: false, demand: [] };
        addFacility(newFacility);
      }
    }
  }, [addClient, addFacility, type]);

  const delNode = useCallback((node: GraphNode, nodeType: NodeType) => {
    if (nodeType === NodeType.CLIENT) {
      removeClient(node.id);
    } else {
      removeFacility(node.id);
    }
  }, [removeClient, removeFacility]);

  const handleSolve = useCallback(() => {
    if (!type) return;

    const solution =
      type === Formulation.PMEDIAN
        ? solveLocationProblem({
          type,
          facilitiesPM: facilityNodes as FacilityNode[],
          p: facilityLimit
        })
        : solveLocationProblem({
          type,
          facilitiesMC: facilityNodes as CoverageNode[],
          demandsMC: clientNodes as CoverageDemand[],
          radius: coverageRange,
          p: facilityLimit
        });

    setResult(solution);

    if (!solution?.bestFacilities) return;

    solution.bestFacilities.forEach((id) => {
      const facility = facilityNodes.find((f) => f.id !== id);
      if (!facility) return;

      updateFacility({
        ...facility,
        isPlaced: false
      });
    });
  }, [
    type,
    facilityNodes,
    facilityLimit,
    clientNodes,
    coverageRange,
    updateFacility
  ]);

  const clearModel = useCallback(() => {
    useClientStore.getState().setClients([]);
    facilityNodes.forEach((f) => removeFacility(f.id));
    useShapeStore.getState().shapes.forEach((s) => {
      useShapeStore.getState().delShape(s.shapeId);
    })
    setResult(null);
  }, [facilityNodes, removeFacility]);

  const selectNewFormulation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    const sp = new URLSearchParams(window.location.search);

    if (v) {
      sp.set("type", v)
    } else {
      sp.delete("type")
    }

    const newUrl = window.location.pathname + (sp.toString() ? `?${sp.toString()}` : "");
    window.history.replaceState(null, "", newUrl);
  }

  const handleFacilityLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setFacilityLimit(Number.isNaN(v) ? 1 : Math.max(1, Math.floor(v)));
  }, []);

  const handleCoverageRangeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setCoverageRange(Number.isNaN(v) ? 0 : v);
  }, []);

  const handleCostSubmit = useCallback(
    (facilityId: number, clientId: number, rawValue: string) => {
      const cost = Number(rawValue);
      if (Number.isNaN(cost)) return;

      const facility = facilityNodes.find((f) => f.id === facilityId);
      if (!facility) return;

      const updatedDemand: FacilityDemand[] = (facility as FacilityNode).demand.map(
        (c) => (c.id === clientId ? { ...c, cost } : c)
      );

      const updatedFacility: FacilityNode = {
        ...facility,
        demand: updatedDemand,
      };

      updateFacility(updatedFacility);
    },
    [facilityNodes, updateFacility]
  );

  const handleClientCostSubmit = useCallback(
    (clientId: number, val: string) => {
      if (!selectedFacility) return;
      handleCostSubmit(selectedFacility.id, clientId, val);
    },
    [selectedFacility, handleCostSubmit]
  );

  const { toggleMap } = useMapDisplayStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleMap();
      }
    },
    [toggleMap]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (type === null) {
    return <div className="p-10 text-gray-400">Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-row py-12 px-8 text-white">
      <section className="flex flex-col flex-1 items-center justify-center transition-all duration-300">
        <Header
          type={type}
          selectNewType={selectNewFormulation}
          facilityLimit={facilityLimit}
          handleFacilityLimitChange={handleFacilityLimitChange}
          coverageRange={coverageRange ?? null}
          handleCoverageRangeChange={handleCoverageRangeChange}
        />

        <div className="w-full max-w-5xl mt-4 space-y-6">
          {Object.values(NodeType).map(nodeType => (
            <CollapsibleList
              key={nodeType}
              title={nodeType === NodeType.CLIENT ? "Demand Nodes" : "Facility Nodes"}
              type={nodeType}
              items={nodeType === NodeType.CLIENT ? clientNodes : facilityNodes}
              facilityLimit={nodeType === NodeType.FACILITY ? facilityLimit : undefined}
              createItem={addNode}
              removeItem={delNode}
              handleCostSubmit={handleClientCostSubmit}
              formulation={type}
            />
          ))}
        </div>

        {type === Formulation.MCLP && (
          <div className="flex flex-col w-full max-w-5xl mt-10 space-y-4 transition-all duration-300">
            <div className="flex flex-row items-center justify-center gap-4">
              {Object.values(ActionEnum).map((act) => (
                <CanvasButton
                  key={act}
                  label={act}
                  onClick={() => selectAction(act)}
                />
              ))}
            </div>

            <div className="w-full flex justify-center">
              <Canvas radius={coverageRange} solution={result} />
            </div>

            {isShowing && (
              <div className="w-full flex flex-col gap-2">
                <LeafletMap
                  radiusMeters={coverageRange}
                  formulation={type}
                  solution={result}
                  defaultCenter={[-10.92, -37.05]}
                  defaultZoom={13}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex w-full max-w-5xl mt-4 justify-between p-4">
          <OptionButton label="Solve" onClick={handleSolve} />
          <OptionButton label="Reset" onClick={() => clearModel()} />
        </div>

        {result && type === Formulation.PMEDIAN && (
          <ResultDisplay
            bestCost={result.bestCost}
            bestFacilities={result.bestFacilities}
            facilityNodes={facilityNodes as FacilityNode[]}
            clientNodes={clientNodes}
            assignments={result.assignments}
          />
        )}
      </section>
    </main>
  );
};

export default FormulationPage;