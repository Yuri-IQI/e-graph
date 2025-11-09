"use client";

import { useState } from "react";
import OptionButton from "../OptionButton/OptionButton";

type SingleValueInputProps = {
    label?: string;
    placeholder?: string;
    initialValue?: string;
    onSubmit: (value: string) => void;
};

const SingleValueInput = ({
    label,
    placeholder = "Enter value...",
    initialValue = "",
    onSubmit,
}: SingleValueInputProps) => {
    const [value, setValue] = useState(initialValue);

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        const trimmed = value.trim();

        if (trimmed === "") {
            setError("Please enter a value.");
            return;
        }

        const num = Number(trimmed);
        if (!Number.isFinite(num)) {
            setError("Please enter a valid number.");
            return;
        }

        onSubmit(trimmed);
        setValue("");
        setError(null);
    };

    return (
        <div
            className="
                w-full border-t border-neutral-700 
                bg-neutral-900/70 backdrop-blur-sm
                px-4 py-3 mt-auto
                flex items-end gap-3
                rounded-b-xl
            "
        >
            <div className="flex flex-col flex-1 gap-1">
                {label && (
                    <label className="text-base font-medium font-bold text-gray-300 tracking-wide">
                        {label}
                    </label>
                )}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="
                        w-full px-3 py-2 text-sm 
                        text-gray-100 placeholder-gray-500
                        bg-neutral-800 border border-neutral-700 
                        rounded-md focus:outline-none focus:ring-2 
                        focus:ring-stone-400 focus:border-transparent
                    "
                />
            </div>

            <OptionButton
                className="
                    flex-shrink-0 px-4 py-2 text-sm font-medium 
                    rounded-md transition-all duration-200
                    bg-stone-600 text-white 
                    hover:bg-stone-500 active:bg-stone-700
                    focus:outline-none focus:ring-2 focus:ring-stone-400
                "
                label="Submit"
                onClick={handleSubmit}
            />
        </div>
    );
};

export default SingleValueInput;