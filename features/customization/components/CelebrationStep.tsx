"use client";

import { useTransition } from "react";

import { Cake, Gift, Heart, Baby, GraduationCap, Church, Sparkles } from "lucide-react";

import { useCustomization } from "../context/CustomizationProvider";

const celebrations = [
  {
    title: "Cumpleaños",
    icon: Cake,
  },
  {
    title: "Boda",
    icon: Heart,
  },
  {
    title: "Baby Shower",
    icon: Baby,
  },
  {
    title: "Aniversario",
    icon: Gift,
  },
  {
    title: "Graduación",
    icon: GraduationCap,
  },
  {
    title: "Bautizo",
    icon: Church,
  },
  {
    title: "Otro",
    icon: Sparkles,
  },
];

export default function CelebrationStep() {
  const {
    updateData,
    nextStep,
  } = useCustomization();

  const [pending, startTransition] =
    useTransition();

  function selectCelebration(
    celebration: string
  ) {
    updateData({
      celebration,
    });

    startTransition(() => {
      setTimeout(() => {
        nextStep();
      }, 250);
    });
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-playfair text-5xl font-bold text-[#0B1423] text-center">
        ¿Qué celebración estás preparando?
      </h2>

      <p className="mt-6 text-center text-lg text-gray-600">
        Elige la ocasión para comenzar a diseñar tu pastel.
      </p>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {celebrations.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              disabled={pending}
              onClick={() =>
                selectCelebration(item.title)
              }
              className="rounded-[28px] border border-gray-200 bg-white p-8 text-left transition hover:-translate-y-2 hover:border-[#D8B07A] hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF8F2]">
                <Icon
                  size={30}
                  className="text-[#D8B07A]"
                />
              </div>

              <h3 className="mt-8 text-2xl font-semibold text-[#0B1423]">
                {item.title}
              </h3>
            </button>
          );
        })}
      </div>
    </section>
  );
}