export default function CateringServices() {
  const services = [
    {
      emoji: "🎂",
      title: "Cumpleaños",
      subtitle: "Haz que su día sea mágico",
      description: "Pasteles temáticos, mesas dulces y todo lo que necesitas para una fiesta inolvidable.",
      features: [
        "Pasteles personalizados",
        "Mesas dulces completas",
        "Cupcakes y cake pops temáticos",
        "Galletas decoradas",
        "Postres individuales",
        "Diseño según temática de la fiesta",
      ],
      highlight: "Cotización a medida",
    },
    {
      emoji: "🏢",
      title: "Corporativo",
      subtitle: "Impresiona a tus colaboradores",
      description: "Coffee breaks, desayunos corporativos y celebraciones empresariales con presentación premium.",
      features: [
        "Coffee breaks y brunch corporativo",
        "Cajas regalo para colaboradores",
        "Pasteles con logo de empresa",
        "Mesas dulces para eventos",
        "Servicio de entrega programada",
        "Facturación empresarial",
      ],
      highlight: "Cotización a medida",
    },
  ];

  return (
    <section className="bg-kc-cream py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-kc-rose-gold">
            Nuestros servicios
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl font-bold text-kc-charcoal md:text-5xl">
            ¿Qué evento estás planeando?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-kc-mocha">
            Cada celebración merece algo especial. Cuéntanos tu idea y la hacemos realidad.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative overflow-hidden rounded-3xl border border-kc-sand bg-white p-10 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-kc-rose-gold/10"
            >
              {/* Decorative gradient on hover */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-kc-rose-gold/5 transition-transform duration-500 group-hover:scale-150" />

              <span className="text-5xl">{service.emoji}</span>

              <h3 className="mt-6 font-[family-name:var(--font-playfair)] text-3xl font-bold text-kc-charcoal">
                {service.title}
              </h3>

              <p className="mt-1 text-sm font-medium text-kc-rose-gold">
                {service.subtitle}
              </p>

              <p className="mt-4 text-kc-mocha">
                {service.description}
              </p>

              <ul className="mt-6 space-y-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-kc-charcoal">
                    <span className="mt-0.5 text-kc-rose-gold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center justify-between">
                <span className="text-lg font-bold text-kc-rose-gold">
                  {service.highlight}
                </span>

                <a
                  href="#cotizar"
                  className="rounded-full bg-kc-charcoal px-6 py-3 text-sm font-semibold text-kc-cream transition-all duration-300 hover:bg-kc-deep hover:shadow-lg"
                >
                  Cotizar ahora
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
