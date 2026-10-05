"use client";

import { useMemo } from "react";

import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";

import { useCart } from "@/features/cart/hooks/useCart";
import { getItemUnitPrice } from "@/features/cart/types/cart.types";

import { useCheckout } from "../../hooks/useCheckout";

import type { PaymentMethod, PaymentType } from "../../types/checkout.types";

const paymentOptions: { value: PaymentMethod; label: string; description: string; icon: string }[] = [
  {
    value: "culqi",
    label: "Tarjeta de crédito/débito",
    description: "Visa, Mastercard, American Express",
    icon: "💳",
  },
  {
    value: "mercadopago",
    label: "Mercado Pago",
    description: "Paga con tu cuenta de Mercado Pago",
    icon: "🏦",
  },
  {
    value: "yape",
    label: "Yape",
    description: "Paga con tu app Yape",
    icon: "📱",
  },
  {
    value: "plin",
    label: "Plin",
    description: "Paga con tu app Plin",
    icon: "📲",
  },
  {
    value: "transfer",
    label: "Transferencia bancaria",
    description: "Depósito o transferencia",
    icon: "🏧",
  },
];

export default function PaymentForm() {
  const {
    checkout,
    setPaymentMethod,
    setPaymentType,
    setNeedsInvoice,
    updateInvoice,
  } = useCheckout();

  const { items } = useCart();

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + getItemUnitPrice(item) * item.cantidad, 0);
  }, [items]);

  const isPickup = checkout.deliveryMethod === "pickup";
  const envio = isPickup ? 0 : (checkout.address.deliveryFee ?? 0);
  const total = subtotal + envio;

  return (
    <Card className="p-6">
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-cake-espresso">
          Método de pago
        </h2>

        <p className="text-sm text-cake-chocolate/60">
          Selecciona cómo deseas pagar tu pedido.
        </p>
      </div>

      {/* Pago del Pedido */}
      <div className="mb-6 rounded-xl border border-kc-sand/60 bg-gradient-to-r from-amber-50/50 to-orange-50/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Pago del pedido
            </span>
            <p className="mt-1 text-xs text-kc-mocha">
              Para programar el horneado y asegurar tu fecha de entrega.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-kc-mocha font-medium">Total a pagar:</span>
            <p className="text-xl font-extrabold text-kc-charcoal">
              S/ {total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {paymentOptions.map((option) => {
          const isSelected = checkout.paymentMethod === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPaymentMethod(option.value)}
              className={`
                w-full rounded-xl border-2 p-4 text-left transition-all
                ${isSelected
                  ? "border-cake-gold bg-cake-gold/5 shadow-sm"
                  : "border-gray-200 bg-white hover:border-cake-rose hover:bg-cake-ivory"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.icon}</span>

                <div className="flex-1">
                  <p className={`font-semibold ${
                    isSelected ? "text-cake-espresso" : "text-gray-800"
                  }`}>
                    {option.label}
                  </p>

                  <p className="text-sm text-gray-500">
                    {option.description}
                  </p>
                </div>

                <div className={`
                  flex h-5 w-5 items-center justify-center rounded-full border-2
                  ${isSelected
                    ? "border-cake-gold bg-cake-gold"
                    : "border-gray-300"
                  }
                `}>
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {checkout.paymentMethod && (
        <div className="mt-6 rounded-lg border border-cake-gold/20 bg-cake-sand/50 p-4">
          <div className="flex items-center justify-between gap-2 text-sm text-cake-chocolate">
            <span className="flex items-center gap-2">
              <span>🔒</span>
              <span>Monto a pagar ahora:</span>
            </span>
            <span className="text-lg font-bold text-cake-gold">
              S/ {total.toFixed(2)}
            </span>
          </div>
          {(checkout.paymentMethod === "culqi" || checkout.paymentMethod === "mercadopago") && (
            <p className="mt-2 text-xs text-cake-chocolate/70">
              El pago con tarjeta se procesará de forma segura al confirmar tu pedido. Tus datos
              están protegidos.
            </p>
          )}
        </div>
      )}

      {/* Opción de Factura */}
      <div className="mt-6 border-t pt-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checkout.needsInvoice}
            onChange={(e) => setNeedsInvoice(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-cake-gold focus:ring-cake-gold"
          />
          <span className="font-semibold text-cake-espresso">
            📄 Necesito factura
          </span>
        </label>

        {checkout.needsInvoice && (
          <div className="mt-4 space-y-4 rounded-xl border border-cake-gold/20 bg-cake-ivory/30 p-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-cake-chocolate">
                RUC
              </label>
              <input
                type="text"
                value={checkout.invoice.ruc}
                onChange={(e) => updateInvoice({ ruc: e.target.value })}
                placeholder="20123456789"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cake-gold focus:ring-2 focus:ring-cake-gold/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-cake-chocolate">
                Razón Social
              </label>
              <input
                type="text"
                value={checkout.invoice.razonSocial}
                onChange={(e) => updateInvoice({ razonSocial: e.target.value })}
                placeholder="Mi Empresa S.A.C."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cake-gold focus:ring-2 focus:ring-cake-gold/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-cake-chocolate">
                Dirección Fiscal
              </label>
              <input
                type="text"
                value={checkout.invoice.direccionFiscal}
                onChange={(e) => updateInvoice({ direccionFiscal: e.target.value })}
                placeholder="Av. Principal 123, Arequipa"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-cake-gold focus:ring-2 focus:ring-cake-gold/20"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}