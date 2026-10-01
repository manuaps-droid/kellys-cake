import {
  Cake,
  Palette,
  Candy,
  Flower2,
  MessageSquareQuote,
  Users,
  CalendarDays,
  Truck,
} from "lucide-react";

import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";

const options = [
  {
    icon: Cake,
    title: "Tamaño",
    description:
      "Desde un pastel íntimo para dos hasta una mesa grande.",
  },
  {
    icon: Palette,
    title: "Colores",
    description:
      "Jugamos con los tonos hasta que calcen con tu temática.",
  },
  {
    icon: Candy,
    title: "Sabores",
    description:
      "Eliges entre los sabores que más nos encargan.",
  },
  {
    icon: Flower2,
    title: "Decoración",
    description:
      "Flores de azúcar, personajes, figuras que tengan sentido para ti.",
  },
  {
    icon: MessageSquareQuote,
    title: "Mensaje",
    description:
      "Anímate con una frase que realmente quiera decir algo.",
  },
  {
    icon: Users,
    title: "Número de personas",
    description:
      "El tamaño se adapta a tu lista de invitados.",
  },
  {
    icon: CalendarDays,
    title: "Fecha y hora",
    description:
      "Elige el día para que llegue fresco a la mesa.",
  },
  {
    icon: Truck,
    title: "Entrega",
    description:
      "Delivery o recojo en tienda, como te quede mejor.",
  },
];

export default function PersonalizationOptionsSection() {
  return (
    <Section className="bg-cake-ivory">
      <SectionHeader
        title="Todo lo que puedes personalizar"
        subtitle="Elegir los detalles es la parte divertida. Tú nos cuentas qué quieres y nosotros lo armamos."
      />

      <div className="mt-20 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <article
              key={option.title}
              className="rounded-[28px] bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cake-gold/10">
                <Icon
                  size={30}
                  className="text-cake-gold"
                />
              </div>

              <h3 className="mt-8 text-xl font-semibold text-cake-espresso">
                {option.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                {option.description}
              </p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}