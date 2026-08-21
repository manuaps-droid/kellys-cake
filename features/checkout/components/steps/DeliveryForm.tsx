"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";

import { useCheckout } from "../../hooks/useCheckout";

export default function DeliveryForm() {
  const {
    checkout,
    setDeliveryMethod,
    setDeliveryInfo,
  } = useCheckout();

  function handleMethodChange(value: string) {
    const method = value as "delivery" | "pickup";
    setDeliveryMethod(method);

    if (method === "pickup") {
      setDeliveryInfo(0, 0);
    } else {
      setDeliveryInfo(null, null);
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-2xl font-bold text-cake-espresso">
          Método de entrega
        </h2>

        <p className="text-sm text-cake-chocolate/60">
          Selecciona cómo deseas recibir tu pedido.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Método</Label>

          <Select
            value={checkout.deliveryMethod}
            onValueChange={handleMethodChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione un método" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="delivery">
                Delivery (se calcula por distancia)
              </SelectItem>

              <SelectItem value="pickup">
                Recojo en tienda (sin costo)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {checkout.deliveryMethod === "pickup" && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              Recojo en tienda — Sin costo de envío
            </p>
            <p className="mt-1 text-xs text-green-600">
              Retira tu pedido directamente en nuestro local.
            </p>
          </div>
        )}

        {checkout.deliveryMethod === "delivery" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-700">
              Delivery por distancia
            </p>
            <p className="mt-1 text-xs text-blue-600">
              En el siguiente paso selecciona tu dirección en el mapa.
              El costo se calculará según la distancia a tu ubicación.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
