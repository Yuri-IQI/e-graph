import { useEffect } from "react";
import { FacilityDemand, GraphNode } from "@/types/nodes";
import { useFacilityStore } from "@/store/useFacilityStore";

export const useSyncFacilityDemands = (clientNodes: GraphNode[]) => {
    const { facilityNodes, setFacilities } = useFacilityStore();

    useEffect(() => {
        if (clientNodes.length === 0 || facilityNodes.length === 0) return;

        let hasChanged = false;

        const updatedFacilities = facilityNodes.map((facility) => {
            const missingClients = clientNodes.filter(
                (client) => !facility.demand.some((d) => d.id === client.id)
            );

            if (missingClients.length > 0) {
                hasChanged = true;
                return {
                    ...facility,
                    demand: [
                        ...facility.demand,
                        ...missingClients.map((c) => c as FacilityDemand),
                    ],
                };
            }

            return facility;
        });

        if (hasChanged) {
            setFacilities(updatedFacilities);
        }
    }, [clientNodes, facilityNodes, setFacilities]);
};