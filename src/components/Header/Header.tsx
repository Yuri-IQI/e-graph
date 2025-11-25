import { Formulation } from "@/types/enums/formulation.enum";
import { HtmlContext } from "next/dist/server/route-modules/pages/vendored/contexts/entrypoints";
import { ChangeEvent } from "react";

type Props = {
    type: Formulation,
    selectNewType: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    facilityLimit: number,
    handleFacilityLimitChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    coverageRange?: number,
    handleCoverageRangeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Header = ({ type, selectNewType, facilityLimit, handleFacilityLimitChange, coverageRange, handleCoverageRangeChange }: Props) => {
    return (
        <header>
            <div className="flex flex-row w-full justify-center max-w-5xl mb-10 items-center space-x-4">
                <select
                    value={type ?? ""}
                    onChange={(e) => selectNewType(e)}
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
                    onChange={(e) => handleFacilityLimitChange(e)}
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
                        onChange={(e) => handleCoverageRangeChange(e)}
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
    );
};


export default Header;