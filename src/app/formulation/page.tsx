"use client";

import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Formulation } from "@/types/enums/formulation.enum";
import { NodeType } from "@/types/enums/nodeType.enum";
import { FacilityNode, GraphNode } from "@/types/nodes";
import CollapsibleList from "@/components/CollapsibleList/CollapsibleList";
import SideMenu from "@/components/SideMenu/SideMenu";
import OptionButton from "@/components/OptionButton/OptionButton";
import { useFacilityStore } from "@/store/useFacilityStore";
import { useSyncFacilityDemands } from "@/hooks/useSyncFacilityDemands";
import { solveLocationProblem } from "@/lib/solutionService";
import { a } from "framer-motion/client";
import AssignmentDisplay from "@/components/AssignmentDisplay/AssignmentDisplay";

const FormulationPage = () => {
  const searchParams = useSearchParams();

  const type = useMemo(
    () => (searchParams.get("type") as Formulation | null),
    [searchParams]
  );

  const [clientNodes, setClientNodes] = useState<GraphNode[]>([]);
  const [facilityLimit, setFacilityLimit] = useState(1);
  const [result, setResult] = useState<{ bestCost: number; bestFacilities: number[]; assignments: { client: number; facility: number; cost: number }[] } | null>(null);

  const {
    facilityNodes,
    addFacility,
    removeFacility,
    selectedFacility,
  } = useFacilityStore();

  useSyncFacilityDemands(clientNodes);

  const isMenuOpen = useMemo(
    () => Boolean(selectedFacility && facilityNodes.some(n => n.id === selectedFacility.id)),
    [selectedFacility, facilityNodes]
  );

  const handleFacilityLimitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setFacilityLimit(Number.isNaN(v) ? 1 : Math.max(1, Math.floor(v)));
  }, []);

  const addNode = useCallback((node: GraphNode, nodeType: NodeType) => {
    if (nodeType === NodeType.CLIENT) {
      setClientNodes(prev => [...prev, node]);
    } else {
      const newFacility: FacilityNode = { ...node, isPlaced: false, demand: [] };
      addFacility(newFacility);
    }
  }, [addFacility]);

  const delNode = useCallback((node: GraphNode, nodeType: NodeType) => {
    if (nodeType === NodeType.CLIENT) {
      setClientNodes(prev => prev.filter(n => n.id !== node.id));
    } else {
      removeFacility(node.id);
    }
  }, [removeFacility]);

  const handleSolve = useCallback(() => {
    if (!type) return;
    setResult(solveLocationProblem(type, facilityLimit, facilityNodes));
  }, [type, facilityLimit, facilityNodes]);

  const clearModel = useCallback(() => {
    setClientNodes([]);
    facilityNodes.forEach(f => removeFacility(f.id));
    setResult(null);
  }, [facilityNodes, removeFacility]);

  if (type === null) {
    return <div className="p-10 text-gray-400">Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-row py-12 px-8 text-white">
      <section className="flex flex-col flex-1 items-center justify-center transition-all duration-300">
        <header className="flex w-full justify-center max-w-5xl mb-10 items-center space-x-4">
          <h1 className="text-3xl font-extrabold tracking-wide">{type} with</h1>

          <label htmlFor="facilityLimit" className="sr-only">Facility limit</label>
          <input
            id="facilityLimit"
            name="facilityLimit"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={facilityLimit}
            onChange={handleFacilityLimitChange}
            aria-label="Facility limit"
            className="
              inline-block px-2 py-1 border border-gray-700 rounded-md
              bg-transparent text-white appearance-textfield
              focus:outline-none focus:ring-2 focus:ring-stone-400
              focus:border-transparent text-center
              [appearance:textfield]
              [&::-webkit-inner-spin-button]:appearance-none
              [&::-webkit-outer-spin-button]:appearance-none
              font-extrabold text-2xl
            "
            style={{
              width: `calc(${Math.max(String(facilityLimit).length, 1)}ch + 1.6rem)`,
            }}
          />

          <span className="text-3xl font-extrabold tracking-wide">facilities</span>
        </header>

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
            />
          ))}
        </div>

        <div className="flex w-full max-w-5xl mt-4 justify-between p-4">
          <OptionButton label="Solve" onClick={handleSolve} />
          <OptionButton label="Reset" onClick={() => clearModel()} />
        </div>

        {result && (
          <section className="flex w-full flex-col max-w-5xl p-4 mt-4 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold mb-4 text-white">Solution Result</h1>

            <div className="flex flex-col sm:flex-row sm:justify-between bg-neutral-800 rounded-xl p-4 mb-4 border border-neutral-700">
              <div>
                <p className="mb-1">
                  <span className="font-medium text-gray-300">Total Cost:</span>{" "}
                  <span className="text-amber-300 font-semibold">{result.bestCost}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-300">Opened Facilities:</span>{" "}
                  <span className="text-amber-300">{result.bestFacilities.map(bf => facilityNodes.find(f => f.id === bf)?.value).join(", ")}</span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Assignments</h2>
              <AssignmentDisplay clientNodes={clientNodes} assignments={result.assignments} />
            </div>
          </section>
        )}
      </section>

      {isMenuOpen && <SideMenu title="Facility Demand Menu" isMenuOpen={isMenuOpen} />}
    </main>
  );
};

export default FormulationPage;