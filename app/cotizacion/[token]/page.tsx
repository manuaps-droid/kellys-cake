import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { createAdminClient } from "@/lib/supabase/admin";

import CargarCotizacionButton from "@/features/cotizaciones/components/CargarCotizacionButton";
import ImprimirButton from "@/features/cotizaciones/components/ImprimirButton";
import {
  COTIZACION_ESTADO_LABELS,
  COTIZACION_ESTADO_STYLES,
} from "@/features/cotizaciones/types/cotizacion.types";

import type { Cotizacion, CotizacionItem } from "@/features/cotizaciones/types/cotizacion.types";

type Props = {
  params: Promise<{ token: string }>;
};

const WHATSAPP_BUSINESS = "945262379";

function fmtSoles(n: number): string {
  return n.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
  });
}

function fmtFecha(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function detallePastel(item: CotizacionItem): { label: string; value: string }[] {
  const lineas: { label: string; value: string }[] = [];

  if (item.sabores) lineas.push({ label: "Sabores", value: item.sabores });
  if (item.rellenos) lineas.push({ label: "Rellenos", value: item.rellenos });
  if (item.decoracion) lineas.push({ label: "Decoración", value: item.decoracion });
  if (item.observaciones) lineas.push({ label: "Observaciones", value: item.observaciones });

  if (lineas.length === 0) {
    for (const l of (item.descripcion ?? "").split("\n")) {
      const i = l.indexOf(":");
      if (i > 0) {
        lineas.push({ label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() });
      }
    }
  }

  return lineas;
}

export default async function CotizacionPublicPage({ params }: Props) {
  const { token } = await params;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("cotizaciones")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const cotizacion = data as unknown as Cotizacion;
  const items = (cotizacion.items ?? []) as CotizacionItem[];

  const numero = `COT-${String(cotizacion.numero ?? 0).padStart(4, "0")}`;
  const fecha = fmtFecha(cotizacion.created_at ?? null);
  const whatsappText = encodeURIComponent(
    `Hola Kelly's Cake, soy ${cotizacion.nombre ?? ""} y les escribo por la cotización ${numero}.`
  );

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .quote-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      <Navbar />

      <main className="bg-kc-cream py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Acciones (no se imprimen) */}
          <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-kc-mocha">
              Comparte este enlace con el cliente o imprímelo en PDF.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_BUSINESS}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-kc-rose-gold px-5 py-2.5 text-sm font-semibold text-kc-rose-gold transition hover:bg-kc-rose-gold/5"
              >
                💬 WhatsApp
              </a>
              <ImprimirButton />
            </div>
          </div>

          {/* Documento de cotización */}
          <div className="quote-sheet mx-auto max-w-[210mm] rounded-3xl border border-kc-sand bg-white p-8 shadow-xl sm:p-12">
            {/* Encabezado */}
            <div className="flex flex-wrap items-start justify-between gap-6 border-b border-kc-sand pb-8">
              <div>
                <p className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-kc-charcoal">
                  Kelly&apos;s Cake
                </p>
                <p className="mt-1 text-sm text-kc-mocha">
                  Pasteles personalizados de alta costura
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold uppercase tracking-widest text-kc-rose-gold">
                  Cotización
                </p>
                <p className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                  {numero}
                </p>
                <p className="mt-1 text-sm text-kc-mocha">{fecha}</p>
              </div>
            </div>

            {/* Cliente y evento */}
            <div className="grid gap-6 border-b border-kc-sand py-8 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-kc-mocha">
                  Cotizado para
                </p>
                <p className="mt-1 text-lg font-semibold text-kc-charcoal">
                  {cotizacion.nombre ?? "Cliente"}
                </p>
                {cotizacion.celular && (
                  <p className="mt-1 text-sm text-kc-mocha">📞 {cotizacion.celular}</p>
                )}
                {cotizacion.email && (
                  <p className="mt-1 text-sm text-kc-mocha">✉️ {cotizacion.email}</p>
                )}
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-kc-mocha">
                  Detalle del evento
                </p>
                <p className="mt-1 text-sm text-kc-charcoal">
                  🎉 {cotizacion.tipo_evento ?? "Catering"}
                </p>
                {cotizacion.fecha_evento && (
                  <p className="mt-1 text-sm text-kc-charcoal">
                    📅 {fmtFecha(cotizacion.fecha_evento)}
                  </p>
                )}
                {cotizacion.num_invitados ? (
                  <p className="mt-1 text-sm text-kc-charcoal">
                    👥 {cotizacion.num_invitados} invitados
                  </p>
                ) : null}
              </div>
            </div>

            {/* Items */}
            <div className="py-8">
              <div className="hidden sm:grid grid-cols-12 gap-3 border-b border-kc-sand pb-2 text-xs font-semibold uppercase tracking-wide text-kc-mocha">
                <div className="col-span-1">Img</div>
                <div className="col-span-4">Producto</div>
                <div className="col-span-2 text-center">Cant.</div>
                <div className="col-span-2 text-right">P. unit</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              <div className="divide-y divide-kc-sand/60">
                {items.map((item, index) => (
                  <div
                    key={item.id ?? index}
                    className="grid grid-cols-12 items-center gap-3 py-4"
                  >
                    <div className="col-span-1">
                      {item.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-kc-blush/30 text-xl">
                          🍰
                        </div>
                      )}
                    </div>
                    <div className="col-span-4">
                      <p className="text-sm font-semibold text-kc-charcoal">{item.nombre}</p>
                      {item.tipo === "pastel" ? (
                        <div className="mt-1 space-y-0.5 text-xs text-kc-mocha">
                          {detallePastel(item).map((d) => (
                            <p key={d.label}>
                              <span className="font-medium text-kc-charcoal">{d.label}: </span>
                              {d.value}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="col-span-2 text-center text-sm text-kc-charcoal">
                      {item.cantidad}
                    </div>
                    <div className="col-span-2 text-right text-sm text-kc-mocha">
                      {fmtSoles(item.precio_unitario)}
                    </div>
                    <div className="col-span-3 text-right text-sm font-bold text-kc-charcoal">
                      {fmtSoles(item.precio_unitario * item.cantidad)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between text-kc-mocha">
                    <span>Subtotal</span>
                    <span>{fmtSoles(cotizacion.subtotal ?? 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-kc-sand pt-3 text-lg font-bold text-kc-charcoal">
                    <span>Total</span>
                    <span>{fmtSoles(cotizacion.total ?? cotizacion.subtotal ?? 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Condiciones */}
            <div className="rounded-2xl border border-kc-blush/40 bg-kc-blush/10 p-6 text-sm leading-7 text-kc-mocha">
              <p className="font-semibold text-kc-charcoal">Condiciones de pago</p>
              <p className="mt-2">
                Para confirmar tu pedido debes realizar un <strong>abono del 50%</strong> como
                mínimo. El saldo se cancela el día de la entrega. Esta cotización tiene una
                validez de 15 días.
              </p>
            </div>

            <div className="no-print mt-8">
              <CargarCotizacionButton token={token} estado={cotizacion.estado} />
            </div>
          </div>

          {/* Estado (no se imprime) */}
          <div className="no-print mt-6 flex justify-center">
            <span
              className={`inline-block rounded-full border px-4 py-1.5 text-sm font-medium ${
                COTIZACION_ESTADO_STYLES[cotizacion.estado] ??
                COTIZACION_ESTADO_STYLES.enviada
              }`}
            >
              Estado: {COTIZACION_ESTADO_LABELS[cotizacion.estado] ?? cotizacion.estado}
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
