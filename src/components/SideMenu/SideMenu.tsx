"use client";

import { useFacilityStore } from "@/store/useFacilityStore";
import { useClientStore } from "@/store/useClientStore";
import { NodeType } from "@/types/enums/nodeType.enum";
import { FacilityDemand } from "@/types/nodes";
import NodeContainer from "../NodeContainer/NodeContainer";
import SingleValueInput from "../SingleValueInput/SingleValueInput";
import { useState } from "react";

type SideMenuProps = {
    title: string;
    isMenuOpen: boolean;
};

const SideMenu = ({ title, isMenuOpen }: SideMenuProps) => {
    const { selectedFacility, updateFacility } = useFacilityStore();
    const { selectedClient } = useClientStore();

    const handleCostSubmit = (val: string) => {
        if (!selectedFacility) return;

        const updatedFacility = {
            ...selectedFacility,
            demand: [...(selectedFacility.demand ?? []), { value: "Client A", id: 1, cost: Number(val) }],
        };

        updateFacility(updatedFacility);
    };

    return (
        <aside
            className={`
                w-80 bg-neutral-800 border-l border-neutral-700 rounded-xl
                p-6 flex flex-col gap-6 shadow-xl overflow-y-auto
                transition-all duration-300
                ${isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 w-0 p-0 border-0 shadow-none"}
            `}
        >
        {isMenuOpen && (
            <>
                <div className="border-b border-neutral-700 pb-4">
                    <h1 className="text-xl font-bold mb-1">{title}</h1>
                    {selectedFacility ? (
                        <h2 className="text-sm font-bold text-gray-300">
                                {selectedFacility.value} ({selectedFacility.id})
                        </h2>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No facility selected</p>
                    )}
                </div>

                {selectedFacility && (
                    <>
                        <NodeContainer
                            nodes={selectedFacility.demand}
                            type={NodeType.CLIENT}
                        />

                        {selectedClient && (
                            <SingleValueInput
                                label="Add Cost"
                                placeholder="Client Cost"
                                onSubmit={handleCostSubmit}
                            />
                        )}
                    </>
                )}
            </>
        )}
        </aside>
    );
};

export default SideMenu;