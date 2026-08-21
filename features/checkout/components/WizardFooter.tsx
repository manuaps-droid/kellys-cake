"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import { useCart } from "@/features/cart/hooks/useCart";

import { useWizard } from "../hooks/useWizard";
import { useCheckout } from "../hooks/useCheckout";
import { CheckoutStep } from "../types/wizard.types";
import { createOrder } from "../actions/create-order.action";
import { chargeWithCulqi } from "../utils/culqi";

export default function WizardFooter() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentStep,
    previous,
    next,
    goTo,
    isFirstStep,
    isLastStep,
  } = useWizard();

  const { checkout, reset } = useCheckout();
  const { subtotal: cartSubtotal } = useCart();

  const isPickup = checkout.deliveryMethod === "pickup";
  const deliveryFee = isPickup ? 0 : (checkout.address.deliveryFee ?? 0);
  const total = cartSubtotal + deliveryFee;
  const montoAbono = Math.round(total * 0.5 * 100) / 100;
  const tipoPago = checkout.paymentType === "abono" ? "abono" : "total";
  const montoPagado = tipoPago === "abono" ? montoAbono : total;

  function handleNext() {
    if (currentStep === CheckoutStep.DELIVERY && isPickup) {
      goTo(CheckoutStep.PAYMENT);
      return;
    }
    next();
  }

  function handlePrevious() {
    if (currentStep === CheckoutStep.PAYMENT && isPickup) {
      goTo(CheckoutStep.DELIVERY);
      return;
    }
    previous();
  }

  async function processPayment(): Promise<{
    success: boolean;
    reference?: string;
    redirect?: boolean;
    message?: string;
  }> {
    const method = checkout.paymentMethod;
    const email = checkout.customer.email;
    const title = "Pedido Kelly's Cake";

    if (!method) {
      return { success: false, message: "Selecciona un método de pago." };
    }

    if (method === "culqi") {
      if (!process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY) {
        return {
          success: false,
          message: "Configura NEXT_PUBLIC_CULQI_PUBLIC_KEY y CULQI_SECRET_KEY en .env.local para habilitar pagos con tarjeta.",
        };
      }

      try {
        const { token } = await chargeWithCulqi({
          amount: montoPagado,
          email,
          description: title,
        });

        const response = await fetch("/api/payments/culqi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            amount: montoPagado,
            currency: "PEN",
            email,
            description: title,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          return { success: false, message: data.message || "Error al procesar el pago." };
        }

        return { success: true, reference: data.reference ?? data.chargeId };
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : "Error al procesar la tarjeta.",
        };
      }
    }

    if (method === "mercadopago") {
      const response = await fetch("/api/payments/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: montoPagado,
          title,
          email,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.init_point) {
        return {
          success: false,
          message: data.message || "Configura MP_ACCESS_TOKEN en .env.local para habilitar pagos con Mercado Pago.",
        };
      }

      window.location.assign(data.init_point);
      return { success: true, redirect: true };
    }

    return { success: true };
  }

  async function handleFinalize() {
    setProcessing(true);
    setError(null);

    try {
      const paymentResult = await processPayment();

      if (!paymentResult.success) {
        setError(paymentResult.message || "Error al procesar el pago.");
        return;
      }

      // Pago procesado fuera del sitio (Mercado Pago Checkout Pro)
      if (paymentResult.redirect) {
        return;
      }

      const orderResult = await createOrder({
        paymentMethod: checkout.paymentMethod || "cash",
        paymentReference: paymentResult.reference,
        deliveryFee,
        tipoPago,
        montoPagado,
      });

      if (!orderResult.success) {
        setError(orderResult.message || "No se pudo crear el pedido.");
        return;
      }

      reset();
      router.replace("/checkout/success");
    } catch (err) {
      setError("Error inesperado. Intenta de nuevo.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  const atAddressStepNoLocation =
    currentStep === CheckoutStep.ADDRESS &&
    !checkout.address.lat;

  return (
    <div className="space-y-4 pt-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || processing}
        >
          Anterior
        </Button>

        {isLastStep ? (
          <Button
            onClick={() => void handleFinalize()}
            disabled={processing}
            className="bg-cake-gold hover:bg-cake-gold/90 text-white"
          >
            {processing ? "Procesando..." : "Confirmar pedido"}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={atAddressStepNoLocation}>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
