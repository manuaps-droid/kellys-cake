import Link from "next/link";
import { Truck, MapPin, Clock, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Política de Envío y Delivery | Kelly's Cake",
  description:
    "Conoce las zonas de cobertura, rangos horarios de entrega y protocolos de traslado de tortas y postres en Arequipa de Kelly's Cake.",
};

const puntosPolitica = [
  {
    icon: MapPin,
    titulo: "1. Zonas de Cobertura en Arequipa",
    descripcion:
      "Realizamos entregas especializadas en los distritos de Arequipa metropolitana, incluyendo Cercado, Yanahuara, Cayma, José Luis Bustamante y Rivero, Paucarpata, Cerro Colorado, Sachaca y zonas aledañas. La tarifa de delivery se calcula de forma automatizada y transparente en función a la dirección exacta ingresada durante el proceso de compra.",
  },
  {
    icon: Clock,
    titulo: "2. Rangos Horarios de Entrega",
    descripcion:
      "Para garantizar la frescura y la estabilidad de las piezas artesanales, las entregas se programan en bloques horarios: Turno Mañana (10:00 am a 1:00 pm) y Turno Tarde (2:00 pm a 6:00 pm). No se pactan entregas a minutos exactos fijos debido a la variabilidad del tráfico y al cuidado riguroso de la velocidad de transporte.",
  },
  {
    icon: ShieldCheck,
    titulo: "3. Transporte Especializado y Cadena de Frío",
    descripcion:
      "Nuestros postres y tortas viajan en vehículos acondicionados con bases niveladas y aire climatizado para evitar deslizamientos, daños estructurales o derretimiento de decoraciones. Cada paquete se entrega sellado con empaque de protección exclusivo.",
  },
  {
    icon: Clock,
    titulo: "4. Protocolo de Espera en Domicilio",
    descripcion:
      "Al llegar a la dirección indicada, el repartidor esperará un máximo de 10 minutos e intentará comunicarse telefónicamente con el cliente al número registrado en la orden para coordinar la entrega en puerta.",
  },
  {
    icon: AlertTriangle,
    titulo: "5. Ausencia del Receptor o Datos Erróneos",
    descripcion:
      "Si transcurrido el tiempo de espera no se logra contacto ni recepción, el pedido retornará a nuestro taller para preservar la cadena de frío y seguridad del alimento. El cliente podrá coordinar el recojo en taller o programar un reenvío asumiendo el costo del nuevo flete, sujeto a la disponibilidad de la ruta logística.",
  },
  {
    icon: CheckCircle2,
    titulo: "6. Verificación y Recepción Conforme",
    descripcion:
      "Recomendamos que la persona que recibe verifique externamente el estado del pedido antes de despedir al repartidor. Cualquier observación debe comunicarse de forma inmediata al repartidor o vía mensaje a nuestros canales oficiales de atención.",
  },
];

export default function PoliticaEnvioPage() {
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
            <Truck className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-4xl font-bold sm:text-5xl">
            Política de Envío y Delivery
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-kc-cream/80">
            Cuidamos cada kilómetro del trayecto para que tu torta llegue intacta, fresca y puntual a tu celebración.
          </p>
        </div>
      </section>

      {/* Puntos de Política */}
      <main className="flex-1 py-14 lg:py-18">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-6">
            {puntosPolitica.map((punto, index) => {
              const Icon = punto.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-kc-sand/40 bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kc-soft-pink/60 text-kc-rose-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-kc-charcoal">
                        {punto.titulo}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                        {punto.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Banner resumen */}
          <div className="mt-12 rounded-3xl border border-kc-rose-gold/30 bg-white p-8 text-center shadow-sm">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-kc-charcoal">
              ¿Deseas recoger tu pedido en taller?
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
              También puedes seleccionar la opción de recojo al momento de tu compra y retirar tu pedido sin costo de envío adicional en nuestro horario de atención previa confirmación.
            </p>
            <div className="mt-5">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-full bg-kc-charcoal px-7 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                Consultar Ubicación de Taller
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
