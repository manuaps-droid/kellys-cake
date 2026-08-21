import Link from "next/link";

export default function PersonalizarExitoPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl bg-white p-10 shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <span className="text-4xl">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-cake-espresso">
          ¡Solicitud enviada!
        </h1>

        <p className="mt-4 text-gray-600">
          Hemos recibido tu solicitud de personalización. Nos pondremos en
          contacto contigo pronto.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-cake-espresso px-8 py-3 font-semibold text-white transition hover:bg-cake-chocolate"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
