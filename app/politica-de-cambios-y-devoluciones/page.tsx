import Link from "next/link";
import {
  RotateCcw,
  ShieldAlert,
  Clock,
  CreditCard,
  AlertCircle,
  BookOpen,
  CheckCircle,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Política de Cambios y Devoluciones | Kelly's Cake",
  description:
    "Política de cambios, cancelaciones y devoluciones de Kelly's Cake: condiciones y plazos aplicables a productos perecibles y personalizados, y proceso de reembolso conforme a la legislación peruana.",
};

export default function PoliticaCambiosDevolucionesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-kc-charcoal py-14 text-center text-kc-cream lg:py-18">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-kc-rose-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-kc-blush/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kc-rose-gold/15 text-kc-rose-gold">
            <RotateCcw className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-4xl font-bold sm:text-5xl">
            Política de Cambios y Devoluciones
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-kc-cream/80">
            Condiciones claras de cambios, cancelaciones y reembolsos para nuestros
            productos perecibles y personalizados, redactadas conforme a la legislación
            peruana de protección al consumidor.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-14 lg:py-18">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-kc-sand/40 bg-white p-8 shadow-sm sm:p-12">

            <div className="space-y-10 text-gray-700">
              {/* Sección 1 */}
              <section>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    1. Alcance y Naturaleza de los Productos
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  La presente política aplica a todas las compras realizadas en
                  <strong> Kelly&apos;s Cake</strong> a través de nuestra tienda web,
                  WhatsApp o atención directa en taller. Nuestros productos son
                  <strong> alimentos pereceros de consumo humano y piezas de pastelería
                  elaboradas a medida</strong> bajo las instrucciones específicas de cada
                  cliente, lo cual condiciona los plazos y supuestos de cambio o devolución
                  aquí descritos.
                </p>
              </section>

              {/* Sección 2 */}
              <section>
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    2. Plazos y Condiciones para Cambios y Reprogramaciones
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Toda solicitud de cambio de fecha de entrega, sabor o diseño básico debe
                  comunicarse con una anticipación mínima de <strong>48 horas</strong> previas
                  a la fecha de entrega programada. La reprogramación quedará sujeta a la
                  disponibilidad de agenda para la nueva fecha solicitada. Los cambios
                  solicitados dentro de este plazo no generan costos adicionales cuando se
                  trata de la misma categoría de producto.
                </p>
              </section>

              {/* Sección 3 */}
              <section>
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    3. Cancelaciones y Devoluciones
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  De conformidad con la <strong>Ley N° 29571 (Código de Protección y Defensa
                  del Consumidor)</strong> y las directrices de <strong>INDECOPI</strong>,
                  por tratarse de productos perecibles y de elaboración personalizada,
                  <strong> no aplica el derecho de retracto ni la devolución una vez que el
                  producto ha sido elaborado o entregado conforme</strong> en el domicilio
                  del cliente.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Las cancelaciones comunicadas con una anticipación mínima de
                  <strong> 48 horas</strong> a la fecha de entrega programada darán derecho
                  al reembolso del importe pagado. Las cancelaciones con menor anticipación
                  <strong> no admitirán devolución dineraria</strong>, debido a la adquisición
                  de insumos perecibles y a los costos de elaboración ya incurridos.
                </p>
              </section>

              {/* Sección 4 */}
              <section>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    4. Productos No Conformes
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Si el producto recibido presenta un <strong>vicio manifiesto, daño o
                  incumplimiento verificable respecto de lo solicitado</strong>, el cliente
                  debe comunicarlo <strong>al momento de la recepción</strong> o, como plazo
                  máximo, dentro de las <strong>primeras 24 horas</strong> siguientes a la
                  entrega, adjuntando evidencia fotográfica a través de nuestros canales
                  oficiales. Verificada la no conformidad, el cliente podrá elegir entre la
                  <strong> reposición sin costo</strong> del producto o el
                  <strong> reembolso integral</strong> del importe pagado, incluido el costo
                  de envío cuando corresponda.
                </p>
              </section>

              {/* Sección 5 */}
              <section>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    5. Proceso de Reembolso
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Aprobada la procedencia del reembolso, este se efectuará por el
                  <strong> mismo medio de pago utilizado en la compra</strong> (tarjeta a
                  través de nuestra pasarela de pagos autorizada, transferencia bancaria o
                  billetera digital según corresponda). La gestión se realiza en un plazo
                  máximo de <strong>5 días hábiles</strong> desde la aprobación, y la
                  efectivización en el medio de pago original puede tardar entre
                  <strong> 5 y 10 días hábiles adicionales</strong> según la entidad
                  financiera emisora.
                </p>
              </section>

              {/* Sección 6 */}
              <section>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    6. Canales para Solicitar Cambios o Devoluciones
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Las solicitudes pueden presentarse a través de nuestro WhatsApp oficial
                  (<a href="https://wa.me/51945262379" className="font-semibold text-kc-rose-gold underline" target="_blank" rel="noopener noreferrer">+51 945 262 379</a>),
                  del correo de contacto publicado en nuestra{" "}
                  <Link href="/contacto" className="font-semibold text-kc-rose-gold underline">
                    página de contacto
                  </Link>{" "}
                  o de forma presencial en el taller. Toda solicitud será respondida y
                  resuelta en un plazo máximo de <strong>15 días hábiles</strong>.
                </p>
              </section>

              {/* Sección 7 */}
              <section>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    7. Libro de Reclamaciones y Normativa Aplicable
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  En cumplimiento de las disposiciones de <strong>INDECOPI</strong>, ponemos
                  a tu disposición nuestro{" "}
                  <Link href="/libro-de-reclamaciones" className="font-semibold text-kc-rose-gold underline">
                    Libro de Reclamaciones Virtual
                  </Link>
                  . Esta política se rige por las leyes de la República del Perú y se integra
                  a nuestros{" "}
                  <Link href="/terminos-y-condiciones" className="font-semibold text-kc-rose-gold underline">
                    Términos y Condiciones
                  </Link>{" "}
                  y a nuestra{" "}
                  <Link href="/politica-de-envio" className="font-semibold text-kc-rose-gold underline">
                    Política de Envío
                  </Link>
                  , que detallan los tiempos y condiciones de entrega.
                </p>
              </section>

            </div>

            <div className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-500">
              Última actualización: Octubre 2026 · Kelly&apos;s Cake Arequipa.
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
