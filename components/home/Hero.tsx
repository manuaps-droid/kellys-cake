import Image from "next/image";
import { Cake, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[#FFF8F2]">
      <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-16 px-6 py-20 lg:flex-row">
        {/* Texto */}
        <div className="flex-1">
          <span className="rounded-full bg-[#F5E9D8] px-4 py-2 text-sm font-medium text-[#0B1423]">
            ✨ Pasteles personalizados
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-tight text-[#0B1423] lg:text-7xl">
            Compartimos tus
            <br />
            mejores momentos
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Diseñamos pasteles personalizados para cumpleaños, bodas,
            aniversarios y toda ocasión especial.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button className="rounded-full bg-[#0B1423] px-8 py-6 text-white hover:bg-[#1d2a44]">
              Personalizar mi pastel
            </Button>

            <Button
              variant="outline"
              className="rounded-full border-[#0B1423] px-8 py-6 text-[#0B1423]"
            >
              Ver catálogo
            </Button>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Cake className="h-5 w-5 text-[#D8B07A]" />
              <span>Diseños personalizados</span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Star className="h-5 w-5 text-[#D8B07A]" />
              <span>Ingredientes de primera calidad</span>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Truck className="h-5 w-5 text-[#D8B07A]" />
              <span>Entregas puntuales</span>
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="flex-1">
          <div className="relative">
            <Image
              src="/images/hero/wedding-cake.jpg"
              alt="Pastel de boda"
              width={650}
              height={650}
              priority
              className="rounded-3xl shadow-2xl"
            />

            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-5 shadow-xl">
              <p className="text-xl text-yellow-500">★★★★★</p>
              <p className="font-semibold">+500 clientes felices</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}