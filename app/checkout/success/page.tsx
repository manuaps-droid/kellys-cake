import Link from "next/link";

import Navbar from "@/components/layout/Navbar";

import MercadoPagoCallback from "@/features/checkout/components/MercadoPagoCallback";

type Props = {
  searchParams: Promise<{
    mp?: string;
    status?: string;
    payment_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const isMercadoPago = params.mp === "1";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-cake-ivory px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 text-center shadow">
          <div className="text-6xl">🎉</div>

          <h1 className="mt-6 text-4xl font-bold text-cake-espresso">
            {isMercadoPago ? "¡Pago procesado!" : "¡Pedido realizado!"}
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Hemos recibido tu pedido correctamente.
          </p>

          <p className="mt-2 text-gray-500">
            Muy pronto nos pondremos en contacto contigo para confirmar los
            detalles.
          </p>

          {isMercadoPago && <MercadoPagoCallback />}

          <div className="mt-10">
            <Link
              href="/"
              className="rounded-xl bg-cake-espresso px-8 py-4 font-semibold text-white transition hover:bg-cake-chocolate"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
