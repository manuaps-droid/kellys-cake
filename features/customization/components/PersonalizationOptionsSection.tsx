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
      "Desde celebraciones íntimas hasta eventos grandes.",
  },
  {
    icon: Palette,
    title: "Colores",
    description:
      "Creamos una combinación perfecta para tu temática.",
  },
  {
    icon: Candy,
    title: "Sabores",
    description:
      "Elige entre nuestras deliciosas combinaciones.",
  },
  {
    icon: Flower2,
    title: "Decoración",
    description:
      "Flores, personajes, figuras y detalles únicos.",
  },
  {
    icon: MessageSquareQuote,
    title: "Mensaje",
    description:
      "Añade una dedicatoria especial para sorprender.",
  },
  {
    icon: Users,
    title: "Número de personas",
    description:
      "Adaptamos el tamaño según tus invitados.",
  },
  {
    icon: CalendarDays,
    title: "Fecha y hora",
    description:
      "Programa tu pedido para el momento perfecto.",
  },
  {
    icon: Truck,
    title: "Entrega",
    description:
      "Delivery o recojo en tienda, tú decides.",
  },
];

export default function PersonalizationOptionsSection() {
  return (
    <Section className="bg-cake-ivory">
      <SectionHeader
        title="Todo lo que puedes personalizar"
        subtitle="Cada pastel es único. Tú eliges los detalles y nosotros los convertimos en una creación inolvidable."
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