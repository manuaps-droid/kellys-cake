"use client";

import { Card } from "@/components/ui/Card";

import { useCheckout } from "../../hooks/useCheckout";

export default function StepReview() {
  const { checkout } = useCheckout();

  const isPickup = checkout.deliveryMethod === "pickup";
  const deliveryFee = isPickup ? 0 : (checkout.address.deliveryFee ?? 0);
  const deliveryDistance = isPickup ? null : checkout.address.deliveryDistance;

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-cake-espresso">
        Resumen del pedido
      </h2>

      <div className="space-y-2">
        <p>
          <strong>Nombre:</strong>{" "}
          {checkout.customer.firstName} {checkout.customer.lastName}
        </p>

        {checkout.customer.recipientName && (
          <p>
            <strong>Recibe:</strong>{" "}
            {checkout.customer.recipientName}
          </p>
        )}

        <p>
          <strong>Email:</strong>{" "}
          {checkout.customer.email}
        </p>

        <p>
          <strong>Teléfono:</strong>{" "}
          {checkout.customer.phone}
        </p>

        <p>
          <strong>Entrega:</strong>{" "}
          {isPickup ? "Recojo en taller" : "Delivery a domicilio"}
        </p>

        <p>
          <strong>Fecha y hora agendada:</strong>{" "}
          <span className="font-semibold text-kc-rose-gold">
            📅 {checkout.deliveryDate || "Por coordinar"} {checkout.deliveryTime ? `· ⏰ ${checkout.deliveryTime}` : ""}
          </span>
        </p>

        {!isPickup && (
          <>
            <p>
              <strong>Distancia:</strong>{" "}
              {deliveryDistance} km
            </p>

            <p>
              <strong>Envío:</strong>{" "}
              S/ {deliveryFee.toFixed(2)}
            </p>
          </>
        )}

        {isPickup && (
          <p>
            <strong>Envío:</strong>{" "}
            S/ 0.00 (Recojo en tienda)
          </p>
        )}

        <p>
          <strong>Pago:</strong>{" "}
          {checkout.paymentMethod}
          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            Pago directo
          </span>
        </p>

        {checkout.paymentReference && (
          <p>
            <strong>N° de operación:</strong>{" "}
            {checkout.paymentReference}
          </p>
        )}

        {checkout.needsInvoice && (
          <div className="rounded-lg border border-cake-gold/20 bg-cake-ivory/30 p-4">
            <p className="font-semibold text-cake-espresso">
              📄 Datos de Factura
            </p>
            <p>
              <strong>RUC:</strong>{" "}
              {checkout.invoice.ruc}
            </p>
            <p>
              <strong>Razón Social:</strong>{" "}
              {checkout.invoice.razonSocial}
            </p>
            <p>
              <strong>Dirección Fiscal:</strong>{" "}
              {checkout.invoice.direccionFiscal}
            </p>
          </div>
        )}

        {!isPickup && (
          <>
            <p>
              <strong>Dirección:</strong>{" "}
              {checkout.address.address}
            </p>

            <p>
              <strong>Distrito:</strong>{" "}
              {checkout.address.district}
            </p>

            <p>
              <strong>Provincia:</strong>{" "}
              {checkout.address.province}
            </p>

            <p>
              <strong>Departamento:</strong>{" "}
              {checkout.address.department}
            </p>

            <p>
              <strong>Referencia:</strong>{" "}
              {checkout.address.reference}
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
