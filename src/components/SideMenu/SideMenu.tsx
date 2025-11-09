"use client";

import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFacilityStore } from "@/store/useFacilityStore";
import { useClientStore } from "@/store/useClientStore";
import { NodeType } from "@/types/enums/nodeType.enum";
import NodeContainer from "../NodeContainer/NodeContainer";
import SingleValueInput from "../SingleValueInput/SingleValueInput";

type SideMenuProps = {
  title: string;
  isMenuOpen: boolean;
};

const SideMenu = ({ title, isMenuOpen }: SideMenuProps) => {
  const { facilityNodes, selectedFacility, updateFacility } = useFacilityStore();
  const { selectedClient } = useClientStore();

  // Memoize facility for faster lookups and less re-renders
  const activeFacility = useMemo(() => {
    if (!selectedFacility) return undefined;
    return facilityNodes.find((f) => f.id === selectedFacility.id);
  }, [selectedFacility, facilityNodes]);

  const handleCostSubmit = useCallback(
    (facilityId: number, clientId: number, rawValue: string) => {
      const cost = Number(rawValue);
      if (Number.isNaN(cost)) return;

      const facility = facilityNodes.find((f) => f.id === facilityId);
      if (!facility) return;

      const updatedFacility = {
        ...facility,
        demand: facility.demand.map((c) =>
          c.id === clientId ? { ...c, cost } : c
        ),
      };

      updateFacility(updatedFacility);
    },
    [facilityNodes, updateFacility]
  );

  const handleClientCostSubmit = useCallback(
    (clientId: number, val: string) => {
      if (!activeFacility) return;
      handleCostSubmit(activeFacility.id, clientId, val);
    },
    [activeFacility, handleCostSubmit]
  );

  const handleSingleInputSubmit = useCallback(
    (val: string) => {
      if (!activeFacility || !selectedClient) return;
      handleCostSubmit(activeFacility.id, selectedClient.id, val);
    },
    [activeFacility, selectedClient, handleCostSubmit]
  );

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.aside
          key="side-menu"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="fixed right-0 top-0 h-full w-80 bg-neutral-800 border-l border-neutral-700 rounded-l-xl flex flex-col shadow-xl overflow-hidden z-40"
        >
          <motion.div
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={
              activeFacility
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0.5, y: -4, scale: 0.995 }
            }
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className={`p-6 border-b border-neutral-700 ${
              !activeFacility ? "pointer-events-none" : ""
            }`}
          >
            <h1 className="text-lg font-semibold text-white mb-1">{title}</h1>
            {activeFacility ? (
              <p className="text-sm text-gray-300">
                {activeFacility.value} ({activeFacility.id})
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">No facility selected</p>
            )}
          </motion.div>

          <motion.div layout className="flex-1 overflow-y-auto px-4 py-3">
            {activeFacility && (
              <NodeContainer
                nodes={activeFacility.demand}
                type={NodeType.CLIENT}
                className="space-y-2"
                handleCostSubmit={handleClientCostSubmit}
              />
            )}
          </motion.div>

          {activeFacility && selectedClient && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="p-4 border-t border-neutral-700"
            >
              <SingleValueInput
                label={`Set cost for ${selectedClient.value} (${selectedClient.id})`}
                placeholder="Client Cost"
                onSubmit={handleSingleInputSubmit}
              />
            </motion.div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;