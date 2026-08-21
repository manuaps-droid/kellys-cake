"use client";

import { Users } from "lucide-react";

import { useCustomization } from "../context/CustomizationProvider";

const options = [
  {
    label: "10 a 15 personas",
    value: 15,
  },
  {
    label: "15 a 20 personas",
    value: 20,
  },
  {
    label: "20 a 30 personas",
    value: 30,
  },
  {
    label: "30 a 50 personas",
    value: 50,
  },
  {
    label: "50 a 80 personas",
    value: 80,
  },
  {
    label: "Más de 80 personas",
    value: 100,
  },
  {
    label: "No estoy seguro, ayúdenme",
    value: 0,
  },
];

export default function PeopleStep() {
  const {
    updateData,
    nextStep,
  } = useCustomization();

  function selectPeople(
    people: number
  ) {
    updateData({
      people,
    });

    setTimeout(() => {
      nextStep();
    }, 250);
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="font-playfair text-5xl font-bold text-[#0B1423] text-center">
        ¿Para cuántas personas será el pastel?
      </h2>

      <p className="mt-6 text-center text-lg text-gray-600">
        Esto nos ayudará a recomendarte el tamaño ideal.
      </p>

      <div className="mt-16 grid gap-5">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() =>
              selectPeople(option.value)
            }
            className="flex items-center gap-5 rounded-3xl border border-gray-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-[#D8B07A] hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF8F2]">
              <Users
                className="text-[#D8B07A]"
                size={28}
              />
            </div>

            <span className="text-lg font-medium text-[#0B1423]">
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}