import Link from "next/link";
import { FileText, ShieldAlert, BookOpen, AlertCircle, Scale, CheckCircle } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Términos y Condiciones | Kelly's Cake",
  description:
    "Términos y condiciones de compra y contratación de servicios de Kelly's Cake, de conformidad con el Código de Protección y Defensa del Consumidor de la República del Perú.",
};

export default function TerminosYCondicionesPage() {
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
            <FileText className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-4xl font-bold sm:text-5xl">
            Términos y Condiciones
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-kc-cream/80">
            Lineamientos claros, transparentes y redactados conforme a la legislación peruana para proteger tu experiencia y garantizar la excelencia en cada pedido.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-14 lg:py-18">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-kc-sand/40 bg-white p-8 shadow-sm sm:p-12">
            
            <div className="space-y-10 text-gray-700">
              {/* Cláusula 1 */}
              <section>
                <div className="flex items-center gap-3">
                  <Scale className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    1. Identificación y Ámbito de Aplicación
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Este sitio web es operado y administrado por <strong>Kelly&apos;s Cake</strong>, taller de pastelería fina y repostería de autor ubicado en la ciudad de Arequipa, Perú. Todos los precios de los productos y servicios indicados en esta plataforma están expresados en Soles peruanos (PEN / S/.) e incluyen los tributos de ley aplicables.
                </p>
              </section>

              {/* Cláusula 2 */}
              <section>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    2. Confirmación de Pedidos y Pago
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Dado que nuestros productos se elaboran con insumos frescos de alta calidad e implican reserva de cupo en agenda, todo pedido se considerará confirmado y agendado únicamente tras la cancelación del <strong>pago total (100%)</strong> del importe correspondiente mediante nuestra pasarela de pagos web autorizada o transferencia verificada.
                </p>
              </section>

              {/* Cláusula 3 */}
              <section>
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    3. Bienes Perecibles y Productos Personalizados
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  De conformidad con la <strong>Ley N° 29571 (Código de Protección y Defensa del Consumidor)</strong> y las directrices de <strong>INDECOPI</strong>, los productos comercializados corresponden a alimentos perecibles de consumo humano y a obras de pastelería personalizadas elaboradas a medida bajo las instrucciones específicas del cliente.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  En virtud de ello, <strong>no aplica el derecho de retracto, cambio o devolución una vez que el producto ha sido elaborado o entregado conforme</strong> en el domicilio del cliente, salvo vicio manifiesto o incumplimiento comprobable de idoneidad en el momento de la recepción.
                </p>
              </section>

              {/* Cláusula 4 */}
              <section>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    4. Modificaciones y Reprogramaciones de Fecha
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Cualquier solicitud de cambio de fecha de entrega, diseño básico o sabor debe comunicarse con una anticipación mínima de <strong>48 horas</strong> previas a la fecha inicialmente programada. La reprogramación quedará sujeta a la disponibilidad de agenda para la nueva fecha solicitada. Cancelaciones con menor tiempo no admitirán devolución dineraria debido a la adquisición de insumos perecibles y costos de elaboración ya incurridos.
                </p>
              </section>

              {/* Cláusula 5 */}
              <section>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    5. Condiciones de Entrega y Recepción
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  El cliente es responsable de consignar con exactitud la dirección de entrega y un número telefónico de contacto activo. El protocolo de delivery incluye una tolerancia de espera de 10 minutos. Es deber del cliente o de la persona designada para recibir el paquete inspeccionar externamente el pedido antes de su recepción. Para mayor detalle, consulta nuestra <Link href="/politica-de-envio" className="font-semibold text-kc-rose-gold underline">Política de Envío</Link>.
                </p>
              </section>

              {/* Cláusula 6 */}
              <section>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    6. Libro de Reclamaciones
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  En cumplimiento de las disposiciones legales peruanas, ponemos a disposición de todos los consumidores nuestro{" "}
                  <Link href="/libro-de-reclamaciones" className="font-semibold text-kc-rose-gold underline">
                    Libro de Reclamaciones Virtual
                  </Link>
                  , garantizando una respuesta oportuna en un plazo máximo de 15 días hábiles.
                </p>
              </section>

              {/* Cláusula 7 */}
              <section>
                <div className="flex items-center gap-3">
                  <Scale className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    7. Ley Aplicable y Jurisdicción
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Los presentes Términos y Condiciones se rigen e interpretan bajo las leyes de la República del Perú. Para la resolución de cualquier discrepancia que no pueda zanjarse de mutuo acuerdo, las partes se someten a la competencia de los jueces y tribunales de la ciudad de Arequipa.
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
