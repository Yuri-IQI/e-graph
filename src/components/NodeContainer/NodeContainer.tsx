import { NodeType } from "@/types/enums/nodeType.enum";
import Item from "../Item/Item";
import { FacilityDemand } from "@/types/nodes";
import { useState } from "react";

type NodeContainerProps = {
    nodes?: FacilityDemand[];
    type: NodeType;
    className?: string;
    handleCostSubmit?: (clientId: number, val: string) => void;
};

const NodeContainer = ({ nodes = [], type, className, handleCostSubmit }: NodeContainerProps) => {
    const [values, setValues] = useState<Record<number, string>>({});
    const [errors, setErrors] = useState<Record<number, string | null>>({});

    if (nodes.length === 0) {
        return (
            <div className="text-sm text-gray-500 italic px-2 py-1">
                No nodes available
            </div>
        );
    }

    const handleChange = (id: number, val: string) => {
        setValues((prev) => ({ ...prev, [id]: val }));
    };

    const handleSubmit = (id: number) => {
        const trimmed = (values[id] ?? "").trim();

        if (trimmed === "") {
            setErrors((prev) => ({ ...prev, [id]: "Please enter a value." }));
            return;
        }

        const num = Number(trimmed);
        if (!Number.isFinite(num)) {
            setErrors((prev) => ({ ...prev, [id]: "Please enter a valid number." }));
            return;
        }

        handleCostSubmit?.(id, trimmed);
        setValues((prev) => ({ ...prev, [id]: "" }));
        setErrors((prev) => ({ ...prev, [id]: null }));
    };

    return (
        <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
            {nodes.map((n) => (
                <div key={n.id} className="flex flex-col items-center">
                    <Item item={n} type={type} permitSelection />
                    {handleCostSubmit ? (
                        <>
                            <div className="flex items-center mt-1">
                                <input
                                    type="text"
                                    value={values[n.id] ?? ""}
                                    onChange={(e) => handleChange(n.id, e.target.value)}
                                    placeholder={n.cost?.toString() ?? "N/A"}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSubmit(n.id);
                                    }}
                                    onBlur={() => handleSubmit(n.id)}
                                    className="w-16 px-2 py-1 text-sm text-center bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent"
                                />
                            </div>
                            {errors[n.id] && (
                                <p className="text-xs text-red-500 mt-0.5">{errors[n.id]}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-base text-center text-gray-400">
                            {n.cost ?? "N/A"}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default NodeContainer;
