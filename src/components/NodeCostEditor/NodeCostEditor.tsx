import { FacilityDemand } from "@/types/nodes";
import { useState } from "react";

const NodeCostEditor = ({
    node,
    handleCostSubmit
}: {
    node: FacilityDemand;
    handleCostSubmit?: (id: number, val: string) => void;
}) => {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        const trimmed = value.trim();

        if (!trimmed) {
            setError("Please enter a value.");
            return;
        }

        const num = Number(trimmed);
        if (!Number.isFinite(num)) {
            setError("Please enter a valid number.");
            return;
        }

        handleCostSubmit?.(node.id, trimmed);
        setValue("");
        setError(null);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center mt-1">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={node.cost?.toString() ?? "N/A"}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                    }}
                    onBlur={() => handleSubmit()}
                    className="w-16 px-2 py-1 text-sm text-center bg-neutral-800 
                               border border-neutral-700 rounded-md 
                               focus:outline-none focus:ring-2 focus:ring-stone-400 
                               focus:border-transparent"
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        </div>
    );
};

export default NodeCostEditor;