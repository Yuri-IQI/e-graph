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

    const handleSubmit = () => {
        if (value.trim() !== "") {
            onSubmit(value);
            setValue("");
        }
    };

    return (
        <div className="flex items-center gap-2">
            {label && <label className="text-sm text-gray-300">{label}</label>}
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="
                    w-40 px-3 py-2 
                    text-sm text-gray-900 
                    rounded-md border border-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-stone-400
                "
            />
            <OptionButton label="Submit" onClick={handleSubmit} />
        </div>
    );
};

export default SingleValueInput;