import { BookOpenText, Info } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FormularioReclamacion from "@/features/reclamos/components/FormularioReclamacion";

export const metadata = {
  title: "Libro de Reclamaciones | Kelly's Cake",
  description:
    "Registra tu reclamo o queja en el Libro de Reclamaciones de Kelly's Cake conforme a la Ley 29571 del Código de Protección y Defensa del Consumidor.",
};

const requisitos = [
  {
    titulo: "Gratuito y disponible 24/7",
    desc: "El registro es gratuito y puedes presentarlo en cualquier momento.",
  },
  {
    titulo: "Respuesta en máximo 15 días hábiles",
    desc: "Responderemos por correo en un plazo máximo de 15 días hábiles, conforme a la normativa vigente.",
  },
  {
    titulo: "Supervisado por INDECOPI",
    desc: "Este libro está sujeto a fiscalización del Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual.",
  },
];

export default function LibroReclamacionesPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-kc-charcoal pt-6 pb-12 text-center text-kc-cream lg:pt-8 lg:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-kc-rose-gold/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-kc-blush/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl px-6">
          <BookOpenText className="mx-auto h-10 w-10 text-kc-rose-gold" />
          <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl font-semibold sm:text-5xl">
            Libro de Reclamaciones
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-kc-cream/80">
            Tu opinión nos importa. Registra formalmente tu reclamo o queja y
            la atenderemos a la brevedad.
          </p>
        </div>
      </section>

      <main className="flex-1 bg-kc-cream py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-6 lg:grid-cols-[1fr_320px]">
          {/* Formulario */}
          <div className="order-2 lg:order-1">
            <FormularioReclamacion />
          </div>

          {/* Panel informativo */}
          <aside className="order-1 space-y-5 lg:sticky lg:top-32 lg:order-2">
            <div className="rounded-3xl border border-kc-sand/60 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-[family-name:var(--font-playfair)] text-lg font-semibold text-kc-charcoal">
                <Info className="h-5 w-5 text-kc-rose-gold" />
                Antes de empezar
              </h2>
              <ul className="mt-4 space-y-4">
                {requisitos.map((r) => (
                  <li key={r.titulo}>
                    <p className="text-sm font-semibold text-kc-charcoal">
                      {r.titulo}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-kc-mocha">
                      {r.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-kc-sand/60 bg-white p-6 shadow-sm">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-kc-charcoal">
                ¿Reclamo o queja?
              </h2>
              <dl className="mt-4 space-y-3 text-xs leading-relaxed">
                <div>
                  <dt className="font-bold tracking-wide text-kc-charcoal uppercase">
                    Reclamo
                  </dt>
                  <dd className="mt-0.5 text-kc-mocha">
                    Disconformidad relacionada con los productos o servicios.
                  </dd>
                </div>
                <div>
                  <dt className="font-bold tracking-wide text-kc-charcoal uppercase">
                    Queja
                  </dt>
                  <dd className="mt-0.5 text-kc-mocha">
                    Disconformidad relacionada con la atención al cliente,
                    sin que necesariamente implique incumplimiento contractual.
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
