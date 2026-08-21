import { getClientPrefillData } from "@/features/checkout/actions/get-client-prefill.action";

import Navbar from "@/components/layout/Navbar";
import CheckoutWizard from "@/features/checkout/components/CheckoutWizard";

export default async function CheckoutPage() {
  const clientData = await getClientPrefillData();

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-cake-espresso">
            Finalizar compra
          </h1>

          <p className="mt-3 text-cake-chocolate/70">
            Completa los datos para finalizar tu pedido.
          </p>
        </div>

        <CheckoutWizard clientData={clientData} />
      </main>
    </>
  );
}
