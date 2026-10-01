import Link from "next/link";

export default function GraciasPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-playfair text-5xl font-bold text-cake-espresso">
        ¡Gracias por tu solicitud!
      </h1>

      <p className="mt-6 text-lg text-gray-600">
        Ya recibimos tu pedido de pastel personalizado.
      </p>

      <p className="mt-3 text-gray-500">
        Te escribimos pronto para afinar los detalles y pasarte la
        cotización.
      </p>

      <Link
        href="/"
        className="mt-10 rounded-xl bg-cake-espresso px-8 py-4 text-white transition hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </main>
  );
}