"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCart } from "@/features/cart/hooks/useCart";
import { addTopperToCartAction } from "@/features/cart/actions/add-topper-to-cart.action";

export type DiseñoTopper = {
  id: string;
  url: string;
  nombre: string;
  precio: number | null;
};

type Props = {
  productoId: string;
  precioBase: number;
  disenos: DiseñoTopper[];
};

const MAX_NOMBRE = 20;

export default function TopperPicker({
  productoId,
  precioBase,
  disenos,
}: Props) {
  const { refreshCart, openDrawer } = useCart();

  const [selected, setSelected] = useState<DiseñoTopper | null>(null);
  const [nombre, setNombre] = useState("");
  const [pending, startTransition] = useTransition();

  function abrirDiseno(d: DiseñoTopper) {
    setNombre("");
    setSelected(d);
  }

  async function handleAgregar() {
    if (!selected) return;

    const nombreClean = nombre.trim();

    if (!nombreClean) {
      toast.error("Escribe el nombre para tu topper.");
      return;
    }

    startTransition(async () => {
      const result = await addTopperToCartAction({
        productoId,
        nombre: nombreClean,
        descripcion: `Topper con el nombre «${nombreClean}» · Diseño «${selected.nombre}»`,
        imagen: selected.url,
        catalogoImagenId: selected.id,
      });

      if (!result.success) {
        toast.error(result.message ?? "No se pudo agregar el topper.");
        return;
      }

      await refreshCart();
      setSelected(null);
      openDrawer();
      toast.success("¡Tu topper fue agregado al carrito!");
    });
  }

  return (
    <section className="bg-kc-cream py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Indicación del flujo */}
        <div className="mb-10 flex flex-col items-center gap-4 rounded-3xl border border-kc-rose-gold/30 bg-gradient-to-r from-kc-ivory via-kc-blush/20 to-kc-ivory px-6 py-6 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-kc-rose-gold/10 text-kc-rose-gold">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-base leading-relaxed text-kc-charcoal sm:text-lg">
            <span className="font-semibold">Escoge tu topper</span> y
            personaliza el nombre. Una vez que elijas, te pedimos el nombre y
            lo agregas directo a tu carrito.
          </p>
        </div>

        {disenos.length === 0 ? (
          <p className="py-10 text-center text-kc-mocha">
            Aún no hay toppers disponibles en este catálogo.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {disenos.map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() => abrirDiseno(d)}
                className="group overflow-hidden rounded-2xl border border-kc-sand bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-kc-rose-gold hover:shadow-xl hover:shadow-kc-rose-gold/10"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={d.url}
                    alt={d.nombre}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {d.precio != null && (
                    <span className="absolute right-2 top-2 rounded-full bg-kc-cream/90 px-2 py-0.5 text-xs font-semibold text-kc-charcoal">
                      S/ {d.precio.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <p className="truncate text-sm font-medium text-kc-charcoal">
                    {d.nombre}
                  </p>
                  <span className="shrink-0 rounded-full bg-kc-rose-gold/10 px-3 py-1 text-xs font-medium text-kc-rose-gold transition-colors group-hover:bg-kc-rose-gold group-hover:text-white">
                    Personalizar
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo para escribir el nombre */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-md bg-kc-cream">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-playfair)] text-xl font-bold text-kc-charcoal">
              Personaliza tu topper
            </DialogTitle>
            <DialogDescription className="text-kc-mocha">
              Escribe el nombre y lo dejamos listo para tu pastel.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-kc-sand">
              <Image
                src={selected.url}
                alt={selected.nombre}
                fill
                sizes="(max-width: 768px) 90vw, 30vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-kc-charcoal/15" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-center">
                <p
                  className="text-3xl font-semibold text-white break-words"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}
                >
                  {nombre.trim() || "Tu nombre"}
                </p>
              </div>
              <span className="absolute left-3 top-3 rounded-full bg-kc-cream/90 px-3 py-1 text-xs font-semibold text-kc-charcoal">
                {selected.nombre}
              </span>
            </div>
          )}

          <div>
            <label
              htmlFor="topper-nombre"
              className="mb-2 block text-sm font-semibold text-kc-charcoal"
            >
              Nombre para el topper
            </label>
            <input
              id="topper-nombre"
              type="text"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value.slice(0, MAX_NOMBRE))
              }
              maxLength={MAX_NOMBRE}
              placeholder={"Ej. Lucía, Daniel y Ana"}
              className="w-full rounded-2xl border border-kc-sand bg-white px-4 py-3 text-base text-kc-charcoal outline-none placeholder:text-kc-mocha/50 focus:border-kc-rose-gold focus:ring-2 focus:ring-kc-rose-gold/30"
            />
            <p
              className={cn(
                "mt-2 text-right text-xs",
                nombre.length >= MAX_NOMBRE
                  ? "text-kc-rose-gold"
                  : "text-kc-mocha"
              )}
            >
              {nombre.length}/{MAX_NOMBRE} caracteres
            </p>
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-col sm:gap-3">
            {selected && (
              <p className="text-center font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                S/{" "}
                {(selected.precio ?? precioBase).toFixed(2)}
                <span className="ml-1 text-xs font-normal text-kc-mocha">
                  IGV incluido
                </span>
              </p>
            )}
            <Button
              type="button"
              onClick={handleAgregar}
              disabled={pending || !nombre.trim()}
              className="w-full rounded-full bg-kc-rose-gold px-8 py-3 text-sm font-medium text-white shadow-md shadow-kc-rose-gold/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-kc-rose-gold/90"
            >
              {pending ? "Agregando..." : "Agregar al carrito"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}