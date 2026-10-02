import Link from "next/link";
import { Shield, Lock, Eye, UserCheck, RefreshCw, Mail } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Política de Privacidad | Kelly's Cake",
  description:
    "Conoce cómo protegemos y tratamos tus datos personales de acuerdo con la Ley N° 29733 de Protección de Datos Personales de la República del Perú.",
};

export default function PoliticaPrivacidadPage() {
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
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-4xl font-bold sm:text-5xl">
            Política de Privacidad
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-kc-cream/80">
            Tu privacidad y confianza son nuestra prioridad. Tratamos tu información con total seguridad y apego a la Ley N° 29733 de la República del Perú.
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
                  <Lock className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    1. Marco Normativo y Responsable
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  En cumplimiento de la <strong>Ley N° 29733 (Ley de Protección de Datos Personales del Perú)</strong> y su Reglamento aprobado mediante Decreto Supremo N° 003-2013-JUS, <strong>Kelly&apos;s Cake</strong> informa a los usuarios sobre las políticas de recopilación, almacenamiento y tratamiento de los datos personales suministrados a través de esta plataforma digital.
                </p>
              </section>

              {/* Sección 2 */}
              <section>
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    2. Datos Personales que Recopilamos
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Recopilamos únicamente los datos necesarios y pertinentes para brindar nuestro servicio de pastelería y delivery:
                </p>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-600 sm:text-base">
                  <li>Nombres y apellidos completos.</li>
                  <li>Número de teléfono móvil o celular para contacto y coordinación de entrega.</li>
                  <li>Dirección de correo electrónico para envío de boletas/facturas y confirmación de compra.</li>
                  <li>Dirección exacta y referencias para el despacho de delivery.</li>
                  <li>Número de documento de identidad (DNI o RUC) para la emisión del comprobante de pago tributario.</li>
                </ul>
              </section>

              {/* Sección 3 */}
              <section>
                <div className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    3. Finalidad del Tratamiento de Datos
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Los datos proporcionados por el usuario serán utilizados con las siguientes finalidades directas:
                </p>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-600 sm:text-base">
                  <li>Procesar, agendar y elaborar tu pedido artesanal conforme a tus requerimientos.</li>
                  <li>Coordinar la logística de entrega a domicilio y verificar la recepción en puerta.</li>
                  <li>Emitir y remitir el comprobante de pago electrónico ante la SUNAT.</li>
                  <li>Gestionar la acumulación de puntos de fidelización y beneficios de tu cuenta de cliente.</li>
                  <li>Atender dudas, solicitudes o consultas a través de nuestros canales de soporte.</li>
                </ul>
              </section>

              {/* Sección 4 */}
              <section>
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    4. Confidencialidad y No Cesión a Terceros
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Kelly&apos;s Cake garantiza la absoluta confidencialidad en el tratamiento de los datos personales. <strong>En ningún caso vendemos, comercializamos ni transferimos tus datos a terceras empresas para fines publicitarios ajenos</strong>. Únicamente se comparte información operativa estrictamente indispensable con los repartidores logísticos o pasarelas de pago para materializar el servicio contratado.
                </p>
              </section>

              {/* Sección 5 */}
              <section>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    5. Ejercicio de Derechos ARCO
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Conforme a la ley peruana, todo titular de datos personales tiene derecho a ejercer sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> respecto de su información almacenada en nuestras bases de datos.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Para ejercer cualquiera de estos derechos o solicitar la baja de tu cuenta, puedes escribirnos directamente a través de nuestra página de <Link href="/contacto" className="font-semibold text-kc-rose-gold underline">Contacto</Link> o a nuestro canal oficial de soporte, adjuntando tu nombre y solicitud.
                </p>
              </section>

              {/* Sección 6 */}
              <section>
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-kc-rose-gold shrink-0" />
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
                    6. Modificaciones a la Política
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Kelly&apos;s Cake se reserva el derecho de actualizar esta política de privacidad cuando sea necesario para cumplir con cambios normativos o mejoras en nuestros servicios digitales. Cualquier modificación será publicada y accesible en esta misma sección.
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
