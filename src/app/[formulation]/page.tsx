"use client";

import { useMemo, useState, useCallback, ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Formulation } from "@/types/enums/formulation.enum";
import { NodeType } from "@/types/enums/nodeType.enum";
import { CoverageDemand, CoverageNode, FacilityNode, GraphNode } from "@/types/nodes";
import CollapsibleList from "@/components/CollapsibleList/CollapsibleList";
import SideMenu from "@/components/SideMenu/SideMenu";
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

const FormulationPage = () => {
  const searchParams = useSearchParams();
  const type = useMemo(
    () => (searchParams.get("type") as Formulation | null),
    [searchParams]
  );

  const [facilityLimit, setFacilityLimit] = useState(1);
  const [coverageRange, setCoverageRange] = useState(0);

  const [result, setResult] = useState<SolutionSet | null>(null);

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
  } = useFacilityStore();

  const { selectAction } = useCanvasActionStore();

  useSyncFacilityDemands(clientNodes);

  const isMenuOpen = useMemo(
    () => Boolean(selectedFacility && facilityNodes.some(n => n.id === selectedFacility.id)),
    [selectedFacility, facilityNodes]
  );

  const addNode = useCallback((node: GraphNode, nodeType: NodeType) => {
    if (nodeType === NodeType.CLIENT) {
      addClient(node);
    } else {
      const newFacility: FacilityNode = { ...node, isPlaced: false, demand: [] };
      addFacility(newFacility);
    }
  }, [addClient, addFacility]);

  const delNode = useCallback((node: GraphNode, nodeType: NodeType) => {
    if (nodeType === NodeType.CLIENT) {
      removeClient(node.id);
    } else {
      removeFacility(node.id);
    }
  }, [removeClient, removeFacility]);

  const handleSolve = useCallback(() => {
    if (!type) return;

    if (type === Formulation.PMEDIAN) {
      setResult(
        solveLocationProblem({
          type,
          facilitiesPM: facilityNodes as FacilityNode[],
          p: facilityLimit
        })
      );
      return;
    }

    if (type === Formulation.MCLP) {
      setResult(
        solveLocationProblem({
          type,
          facilitiesMC: facilityNodes as CoverageNode[],
          demandsMC: clientNodes as CoverageDemand[],
          radius: coverageRange,
          p: facilityLimit
        })
      );
      return;
    }
  }, [type, facilityNodes, clientNodes, coverageRange, facilityLimit]);

  const clearModel = useCallback(() => {
    useClientStore.getState().setClients([]);
    facilityNodes.forEach((f) => removeFacility(f.id));
    setResult(null);
  }, [facilityNodes, removeFacility]);

  const selectNewFormulation = (e: ChangeEvent<HTMLSelectElement>) => {
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
    setCoverageRange(Number.isNaN(v) ? 1 : Math.max(1, Math.floor(v)));
  }, []);

  if (type === null) {
    return <div className="p-10 text-gray-400">Loading...</div>;
  }

  return (
    <main className="min-h-screen flex flex-row py-12 px-8 text-white">
      <section className="flex flex-col flex-1 items-center justify-center transition-all duration-300">
        <header>
          <div className="flex flex-row w-full justify-center max-w-5xl mb-10 items-center space-x-4">
            <select
              value={type ?? ""}
              onChange={(e) => selectNewFormulation(e)}
              className="
                inline-block px-2 py-2 border border-gray-700 
                rounded-md text-white bg-neutral-900 appearance-none
                focus:outline-none focus:ring-2 focus:ring-stone-400
                focus:border-transparent text-center text-2xl font-extrabold
                transition-colors duration-150
              "
              aria-label="Formulation"
            >
              <option value="" disabled hidden>
                {type ?? "Select type"}
              </option>

              {Object.values(Formulation).map((value) => (
                <option
                  key={value}
                  value={value}
                  className="
                    bg-neutral-900 text-white
                    hover:bg-balck-700 focus:bg-black-700
                    cursor-pointer
                  "
                >
                  {value}
                </option>
              ))}
            </select>

            <h1 className="text-3xl font-extrabold tracking-wide">with</h1>

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
                bg-neutral-900 text-white appearance-textfield
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

            <h1 className="text-3xl font-extrabold tracking-wide">facilities</h1>
          </div>
          {type === Formulation.MCLP && (
            <div className="flex flex-row w-full justify-center max-w-5xl mb-10 items-center space-x-4">
              <h1 className="text-3xl font-extrabold tracking-wide">and</h1>
              <input
                id="coverageRange"
                name="coverageRange"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={coverageRange}
                onChange={handleCoverageRangeChange}
                aria-label="Coverage Range"
                className="
                  inline-block px-2 py-1 border border-gray-700 rounded-md
                  bg-neutral-900 text-white appearance-textfield
                  focus:outline-none focus:ring-2 focus:ring-stone-400
                  focus:border-transparent text-center
                  [appearance:textfield]
                  [&::-webkit-inner-spin-button]:appearance-none
                  [&::-webkit-outer-spin-button]:appearance-none
                  font-extrabold text-2xl
                "
                style={{
                  width: `calc(${Math.max(String(coverageRange).length, 1)}ch + 1.6rem)`,
                }}
              />

              <h1 className="text-3xl font-extrabold tracking-wide">coverage range</h1>
            </div>
          )}
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
              <Canvas />
            </div>

          </div>
        )}

        <div className="flex w-full max-w-5xl mt-4 justify-between p-4">
          <OptionButton label="Solve" onClick={handleSolve} />
          <OptionButton label="Reset" onClick={() => clearModel()} />
        </div>

        {result && (
          <ResultDisplay
            bestCost={result.bestCost}
            bestFacilities={result.bestFacilities}
            facilityNodes={facilityNodes as FacilityNode[]}
            clientNodes={clientNodes}
            assignments={result.assignments}
          />
        )}
      </section>

      {isMenuOpen && <SideMenu title="Facility Demand Menu" isMenuOpen={isMenuOpen} />}
    </main>
  );
};

export default FormulationPage;