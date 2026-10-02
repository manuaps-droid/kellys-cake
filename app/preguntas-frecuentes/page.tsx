import Link from "next/link";
import { HelpCircle, MessageCircle, Clock, CreditCard, Truck, ShieldCheck, Thermometer } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Preguntas Frecuentes | Kelly's Cake",
  description:
    "Resuelve tus dudas sobre pedidos, tiempos de anticipación, delivery en Arequipa, métodos de pago y conservación de tortas en Kelly's Cake.",
};

const faqs = [
  {
    icon: Clock,
    pregunta: "¿Con cuánta anticipación debo hacer mi pedido?",
    respuesta:
      "Para tortas de catálogo, boxes y postres, recomendamos un mínimo de 24 a 48 horas. Para tortas de autor personalizadas y piezas de celebración de gran tamaño, sugerimos solicitar tu pedido con 3 a 5 días de anticipación para asegurar tu fecha en agenda.",
  },
  {
    icon: CreditCard,
    pregunta: "¿Cómo se realiza el pago?",
    respuesta:
      "Todos los pedidos se confirman mediante la cancelación total (100%) antes de entrar a producción. Puedes pagar de forma 100% segura mediante tarjeta de crédito/débito en nuestra web, Yape, Plin o transferencia bancaria directa.",
  },
  {
    icon: Truck,
    pregunta: "¿Cómo entregan las tortas y productos?",
    respuesta:
      "Contamos con servicio de delivery especializado en vehículo acondicionado para asegurar que tu torta viaje estable y llegue impecable a tu domicilio en Arequipa. También puedes coordinar el recojo gratuito en nuestro taller.",
  },
  {
    icon: Thermometer,
    pregunta: "¿Cómo debo conservar mi torta una vez recibida?",
    respuesta:
      "Nuestras tortas artesanales deben mantenerse refrigeradas (entre 4 °C y 8 °C). Si tu torta tiene cobertura de buttercream o crema especial, te recomendamos retirarla de la refrigeradora unos 20 a 30 minutos antes de cantar cumpleaños para que alcance su textura y sabor ideales.",
  },
  {
    icon: ShieldCheck,
    pregunta: "¿Puedo reprogramar la fecha de entrega de mi pedido?",
    respuesta:
      "Sí. Comprendemos que las celebraciones pueden cambiar de fecha. Puedes solicitar una reprogramación notificándonos con un mínimo de 48 horas de anticipación a la fecha programada, sujeta a la disponibilidad de agenda para la nueva fecha.",
  },
  {
    icon: HelpCircle,
    pregunta: "¿Hacen tortas para mascotas o dietas especiales?",
    respuesta:
      "¡Sí! Contamos con nuestra exclusiva Área Pet (tortas y galletas aptas para perritos y gatitos con ingredientes naturales certificados) y opciones de pastelería personalizada donde adaptamos rellenos y decoraciones según tus preferencias.",
  },
];

export default function PreguntasFrecuentesPage() {
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
            <HelpCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-4xl font-bold sm:text-5xl">
            Preguntas Frecuentes
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-kc-cream/80">
            Todo lo que necesitas saber sobre anticipación, pedidos, delivery y el cuidado de tus postres artesanales.
          </p>
        </div>
      </section>

      {/* FAQ Grid */}
      <main className="flex-1 py-14 lg:py-18">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq, index) => {
              const Icon = faq.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col justify-between rounded-2xl border border-kc-sand/40 bg-white p-7 shadow-sm transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kc-soft-pink/60 text-kc-rose-gold">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-kc-charcoal">
                        {faq.pregunta}
                      </h2>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      {faq.respuesta}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact CTA */}
          <div className="mt-14 rounded-3xl border border-kc-sand/40 bg-white p-8 text-center shadow-sm sm:p-10">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-kc-charcoal">
              ¿Tienes una consulta adicional para tu evento?
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
              Nuestro equipo está disponible para ayudarte a coordinar cada detalle de tu pastel o mesa de dulces.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-full bg-kc-charcoal px-7 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                Escríbenos por Contacto
              </Link>
              <Link
                href="/personalizar"
                className="inline-flex items-center gap-2 rounded-full border border-kc-charcoal/20 bg-kc-cream px-7 py-3 text-sm font-semibold text-kc-charcoal transition hover:border-kc-charcoal"
              >
                Diseñar Torta Personalizada
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
