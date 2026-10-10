"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import { useCart } from "@/features/cart/hooks/useCart";

import { useWizard } from "../hooks/useWizard";
import { useCheckout } from "../hooks/useCheckout";
import { CheckoutStep } from "../types/wizard.types";
import { createOrder } from "../actions/create-order.action";
import { chargeWithCulqi, openCulqiBilletera } from "../utils/culqi";
import { MERCADOPAGO_HABILITADO } from "../constants/payment-methods.constants";

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
  const { subtotal: cartSubtotal, refreshCart } = useCart();

  const isPickup = checkout.deliveryMethod === "pickup";
  const deliveryFee = isPickup ? 0 : (checkout.address.deliveryFee ?? 0);
  const total = cartSubtotal + deliveryFee;
  const tipoPago = "total" as const;
  const montoPagado = total;

  function handleNext() {
    if (currentStep === CheckoutStep.DELIVERY) {
      if (!checkout.deliveryDate) {
        setError("Por favor selecciona la fecha de entrega o recojo.");
        return;
      }
      setError(null);
      if (isPickup) {
        goTo(CheckoutStep.PAYMENT);
        return;
      }
    }
    setError(null);
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

    if (method === "culqi" || method === "yape") {
      if (!process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY) {
        return {
          success: false,
          message: "Configura NEXT_PUBLIC_CULQI_PUBLIC_KEY y CULQI_SECRET_KEY en .env.local para habilitar pagos en línea.",
        };
      }

      try {
        // El checkout de Culqi maneja tarjeta y Yape (número Yape + código
        // de aprobación). El token devuelto se cobra con /v2/charges.
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
            deliveryFee,
            tipoPago,
            currency: "PEN",
            email,
            description: title,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          return { success: false, message: data.message || "Error al procesar el pago." };
        }

        return { success: true, reference: data.chargeId ?? data.reference };
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : "Error al procesar la tarjeta.",
        };
      }
    }

    if (method === "mercadopago" && MERCADOPAGO_HABILITADO) {
      const response = await fetch("/api/payments/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: montoPagado,
          deliveryFee,
          tipoPago,
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

    // Pagos manuales: solo transferencia bancaria.
    if (method === "transfer") {
      const reference = checkout.paymentReference?.trim();

      if (!reference) {
        return {
          success: false,
          message:
            "Ingresa el número de operación del pago para continuar con tu pedido.",
        };
      }

      return { success: true, reference };
    }

    return { success: true };
  }

  async function finalizePlin(): Promise<void> {
    const email = checkout.customer.email;
    const title = "Pedido Kelly's Cake";

    // 1. Crear la orden de pago en Culqi (billetera móvil)
    const res = await fetch("/api/payments/culqi/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        description: title,
        deliveryFee,
        firstName: checkout.customer.firstName,
        lastName: checkout.customer.lastName,
        phone: checkout.customer.phone,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.orderId) {
      setError(data.message || "No se pudo iniciar el pago con Plin.");
      return;
    }

    // 2. Crear el pedido como pendiente, vinculado a la orden de Culqi
    const orderResult = await createOrder({
      paymentMethod: "plin",
      paymentReference: data.orderId,
      deliveryFee,
      tipoPago,
      montoPagado,
      fechaEntrega: checkout.deliveryDate || undefined,
      horaEntrega: checkout.deliveryTime || undefined,
      tipoEntrega: checkout.deliveryMethod || undefined,
    });

    if (!orderResult.success) {
      setError(orderResult.message || "No se pudo crear el pedido.");
      return;
    }

    // 3. Abrir el checkout de Culqi con el QR de billeteras (Plin)
    try {
      await openCulqiBilletera({
        amount: montoPagado,
        email,
        description: title,
        orderId: data.orderId,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo abrir el pago con Plin."
      );
      return;
    }

    await refreshCart();
    reset();
    router.replace("/checkout/success");
  }

  async function handleFinalize() {
    setProcessing(true);
    setError(null);

    try {
      if (checkout.paymentMethod === "plin") {
        await finalizePlin();
        return;
      }

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
        fechaEntrega: checkout.deliveryDate || undefined,
        horaEntrega: checkout.deliveryTime || undefined,
        tipoEntrega: checkout.deliveryMethod || undefined,
      });

      if (!orderResult.success) {
        setError(orderResult.message || "No se pudo crear el pedido.");
        return;
      }

      await refreshCart();
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
