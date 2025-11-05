"use client";

import { useRouter } from "next/navigation";
import OptionButton from "@/components/OptionButton/OptionButton";
import { Formulation } from "@/types/enums/formulation.enum";

export default function Home() {
  const router = useRouter();

  const goToFormulationPage = (formulation: Formulation) => {
    router.push(`/formulation?type=${formulation}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center justify-center w-full max-w-5xl gap-12">
        {Object.values(Formulation).map((value) => (
          <OptionButton
            key={value}
            label={value}
            onClick={() => goToFormulationPage(value)}
          />
        ))}
      </div>
    </main>
  );
}