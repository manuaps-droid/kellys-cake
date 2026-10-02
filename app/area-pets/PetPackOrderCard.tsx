"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Sparkles, Check, Heart } from "lucide-react";
import { toast } from "sonner";
import { addPetPackToCartAction } from "@/features/cart/actions/add-pet-pack-to-cart.action";
import { useCart } from "@/features/cart/hooks/useCart";

export default function PetPackOrderCard() {
  const router = useRouter();
  const { openDrawer, refreshCart } = useCart();
  const [nombreMascota, setNombreMascota] = useState("");
  const [tipoMascota, setTipoMascota] = useState<"perro" | "gato">("perro");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddToCart(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await addPetPackToCartAction({
        nombreMascota: nombreMascota.trim(),
        esGato: tipoMascota === "gato",
        observaciones: observaciones.trim(),
      });

      if (!res.success) {
        toast.error(res.message || "No se pudo agregar al carrito.");
        return;
      }

      await refreshCart();
      toast.success("¡Pack Celebración Pet agregado a tu carrito! 🐾");
      openDrawer();
    } catch (err: any) {
      toast.error(err.message || "Error al conectar con el carrito.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 p-6 sm:p-8 border border-kec-sand/60">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-2xl border border-kec-sand/40">
          🎁
        </div>

        <h4 className="mt-3 font-[family-name:var(--font-playfair)] text-xl font-bold text-kec-charcoal text-center">
          Pide en Línea o por WhatsApp
        </h4>

        <p className="mt-1.5 text-xs leading-relaxed text-kec-mocha text-center">
          Agrégalo directamente al carrito y cancela con tarjeta, transferencia bancaria o Yape.
        </p>

        {/* Formulario rápido para la tarjeta del festejo */}
        <form onSubmit={handleAddToCart} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-kec-charcoal uppercase tracking-wider mb-1">
              Nombre de tu Mascota (para su kit)
            </label>
            <input
              type="text"
              value={nombreMascota}
              onChange={(e) => setNombreMascota(e.target.value)}
              placeholder="Ej. Firulais, Luna, Milo..."
              className="w-full rounded-xl border border-kec-sand bg-white px-3.5 py-2.5 text-xs text-kec-charcoal placeholder:text-gray-400 focus:border-kec-rose-gold focus:outline-none focus:ring-1 focus:ring-kec-rose-gold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-kec-charcoal uppercase tracking-wider mb-1">
              ¿Para quién es la fiesta?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoMascota("perro")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  tipoMascota === "perro"
                    ? "border-amber-500 bg-amber-100/90 text-amber-950 shadow-sm ring-2 ring-amber-400/50"
                    : "border-kec-sand/80 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>🐶</span>
                <span className="text-gray-900 font-bold">Perrito</span>
                {tipoMascota === "perro" && <span className="text-amber-700 text-[10px]">✓</span>}
              </button>

              <button
                type="button"
                onClick={() => setTipoMascota("gato")}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                  tipoMascota === "gato"
                    ? "border-amber-500 bg-amber-100/90 text-amber-950 shadow-sm ring-2 ring-amber-400/50"
                    : "border-kec-sand/80 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>🐱</span>
                <span className="text-gray-900 font-bold">Gatito</span>
                {tipoMascota === "gato" && <span className="text-amber-700 text-[10px]">✓</span>}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-kec-charcoal uppercase tracking-wider mb-1">
              Alergias o Nota Especial (Opcional)
            </label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Sin pollo, fecha especial..."
              className="w-full rounded-xl border border-kec-sand bg-white px-3.5 py-2 text-xs text-kec-charcoal placeholder:text-gray-400 focus:border-kec-rose-gold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-kec-charcoal px-6 py-3.5 text-sm font-semibold text-kec-cream shadow-md transition-all duration-300 hover:bg-kec-deep hover:shadow-xl hover:scale-[1.01] disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4 text-kec-rose-gold" />
            {loading ? "Agregando..." : "Agregar al Carrito (S/ 69)"}
          </button>
        </form>
      </div>

      <div className="mt-5 border-t border-kec-sand/60 pt-4 space-y-2 text-left text-xs text-kec-mocha">
        <div className="flex items-center gap-2">
          <span className="text-kec-rose-gold font-bold">✓</span>
          <span>Entrega programada en checkout (Arequipa)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-kec-rose-gold font-bold">✓</span>
          <span>Pago seguro (Yape, Tarjeta o Transferencia)</span>
        </div>
      </div>
    </div>
  );
}
