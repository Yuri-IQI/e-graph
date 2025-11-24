import { useEffect } from "react";
import { FacilityDemand, GraphNode } from "@/types/nodes";
import { useFacilityStore } from "@/store/useFacilityStore";

export const useSyncFacilityDemands = (clientNodes: GraphNode[]) => {
    const { facilityNodes, setFacilities } = useFacilityStore();

    useEffect(() => {
        if (facilityNodes.length === 0) return;

        let hasChanged = false;

        const clientIds = new Set(clientNodes.map((c) => c.id));

        const updatedFacilities = facilityNodes.map((facility) => {
            if (!("demand" in facility)) return facility;

            const currentDemand = facility.demand;
            const clientIds = new Set(clientNodes.map((c) => c.id));

            const missingClients = clientNodes.filter(
                (client) => !currentDemand.some((d) => d.id === client.id)
            );

            const filteredDemand = currentDemand.filter((d) => clientIds.has(d.id));

            if (
                missingClients.length > 0 ||
                filteredDemand.length !== currentDemand.length
            ) {
                hasChanged = true;

                return {
                    ...facility,
                    demand: [
                        ...filteredDemand,
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