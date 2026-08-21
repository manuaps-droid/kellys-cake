"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { useCustomization } from "../context/CustomizationProvider";

export default function WelcomeStep() {
  const { nextStep } =
    useCustomization();

  return (
    <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#D8B07A]/10">
        <Sparkles
          size={40}
          className="text-[#D8B07A]"
        />
      </div>

      <h1 className="mt-10 font-playfair text-6xl font-bold text-[#0B1423]">
        Diseñemos tu pastel
      </h1>

      <p className="mt-8 max-w-2xl text-xl leading-9 text-gray-600">
        Nos emociona ser parte de tu celebración.
        En unos minutos conoceremos tu idea para
        preparar una propuesta personalizada.
      </p>

      <Button
        onClick={nextStep}
        size="lg"
        className="mt-14 rounded-full px-10 py-7 text-lg"
      >
        Comenzar
      </Button>
    </section>
  );
}