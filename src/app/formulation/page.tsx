"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Formulation } from "@/types/enums/formulation.enum";
import CollapsibleList from "@/components/CollapsibleList/CollapsibleList";
import { FacilityNode, GraphNode } from "@/types/nodes";
import { NodeType } from "@/types/enums/nodeType.enum";
import SideMenu from "@/components/SideMenu/SideMenu";
import { useFacilityStore } from "@/store/useFacilityStore";
import { useSyncFacilityDemands } from "@/hooks/useSyncFacilityDemands";

const FormulationPage = () => {
  const searchParams = useSearchParams();
  const type = useMemo(
    () => searchParams.get("type") as Formulation | null,
    [searchParams]
  );

  const [clientNodes, setClientNodes] = useState<GraphNode[]>([]);
  const {
    facilityNodes,
    addFacility,
    removeFacility,
    selectedFacility,
  } = useFacilityStore();

  useSyncFacilityDemands(clientNodes);

  const isMenuOpen = useMemo(
    () => !!selectedFacility && facilityNodes.some((n) => n.id === selectedFacility.id),
    [selectedFacility, facilityNodes]
  );

  if (type === null) {
    return <div className="p-10 text-gray-400">Loading...</div>;
  }

  const addNode = (node: GraphNode, nodeType: NodeType) => {
    if (nodeType === NodeType.CLIENT) {
      setClientNodes((prev) => [...prev, node]);
    } else {
      const newFacility: FacilityNode = { ...node, isPlaced: false, demand: [] };
      addFacility(newFacility);
    }
  };

  const delNode = (node: GraphNode, nodeType: NodeType) => {
    if (nodeType === NodeType.CLIENT) {
      setClientNodes((prev) => prev.filter((n) => n.id !== node.id));
    } else {
      removeFacility(node.id);
    }
  };

  return (
    <main className="min-h-screen text-white flex flex-row py-12 px-8">
      <section className="flex flex-col flex-1 items-center transition-all duration-300">
        <header className="w-full max-w-5xl mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-wide mb-2">{type}</h1>
        </header>

        <div className="w-full max-w-5xl space-y-6">
          {Object.values(NodeType).map((value) => (
            <CollapsibleList
              key={value}
              title={value === NodeType.CLIENT ? "Demand Nodes" : "Facility Nodes"}
              type={value}
              items={value === NodeType.CLIENT ? clientNodes : facilityNodes}
              createItem={(node, type) => addNode(node, type)}
              removeItem={(node, type) => delNode(node, type)}
            />
          ))}
        </div>
      </section>

      {isMenuOpen && (
        <SideMenu title="Facility Demand Menu" isMenuOpen={isMenuOpen} />
      )}
    </main>
  );
};

export default FormulationPage;