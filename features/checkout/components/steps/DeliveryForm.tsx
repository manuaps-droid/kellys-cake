"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Truck, Store, Info } from "lucide-react";

import { useCheckout } from "../../hooks/useCheckout";
import { useCart } from "@/features/cart/hooks/useCart";

export default function DeliveryForm() {
  const {
    checkout,
    setDeliveryMethod,
    setDeliveryInfo,
    setDeliverySchedule,
  } = useCheckout();

  const { items } = useCart();

  // Fecha mínima: mañana
  const manana = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Auto-detectar si hay alguna fecha pre-establecida en los ítems del carrito
  useEffect(() => {
    if (!checkout.deliveryDate) {
      let detectedDate = "";
      let detectedTime = "11:00 - 13:00";

      for (const item of items) {
        if (item.descripcion) {
          const mDate = item.descripcion.match(/(?:Fecha(?: de entrega| requerida)?:?|Entrega:?)\s*(\d{4}-\d{2}-\d{2})/i);
          if (mDate?.[1]) {
            detectedDate = mDate[1];
            if (item.descripcion.includes("Mañana")) detectedTime = "09:00 - 11:00";
            if (item.descripcion.includes("Tarde")) detectedTime = "14:00 - 16:00";
            break;
          }
        }
      }

      setDeliverySchedule(detectedDate || manana, checkout.deliveryTime || detectedTime);
    }
  }, [items, checkout.deliveryDate, checkout.deliveryTime, manana, setDeliverySchedule]);

  function handleMethodChange(value: string) {
    const method = value as "delivery" | "pickup";
    setDeliveryMethod(method);

    if (method === "pickup") {
      setDeliveryInfo(0, 0);
    } else {
      setDeliveryInfo(null, null);
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDeliverySchedule(e.target.value, checkout.deliveryTime || "11:00 - 13:00");
  }

  function handleTimeChange(value: string) {
    setDeliverySchedule(checkout.deliveryDate || manana, value);
  }

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-2xl font-bold text-cake-espresso">
          Programación de entrega y horario
        </h2>

        <p className="text-sm text-cake-chocolate/60">
          Selecciona cómo y cuándo deseas recibir tu pedido en Arequipa.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* MÉTODO DE ENTREGA */}
        <div className="space-y-2">
          <Label className="font-semibold text-kc-charcoal">Método de recepción *</Label>

          <Select
            value={checkout.deliveryMethod}
            onValueChange={handleMethodChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione un método" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="delivery">
                🚚 Delivery especializado a domicilio (calculado por distancia)
              </SelectItem>

              <SelectItem value="pickup">
                🏬 Recojo en nuestro taller (Arequipa · Sin costo de envío)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {checkout.deliveryMethod === "pickup" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
            <Store className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Recojo gratuito en taller
              </p>
              <p className="mt-0.5 text-xs text-emerald-700">
                Podrás retirar tu pedido directamente en nuestro taller en el horario y fecha elegidos.
              </p>
            </div>
          </div>
        )}

        {checkout.deliveryMethod === "delivery" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex items-start gap-3">
            <Truck className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Delivery acondicionado en Arequipa
              </p>
              <p className="mt-0.5 text-xs text-blue-700">
                En el siguiente paso podrás confirmar tu ubicación exacta en el mapa para calcular el costo de envío directo a tu domicilio.
              </p>
            </div>
          </div>
        )}

        {/* FECHA Y HORA DE PRODUCCIÓN / ENTREGA */}
        <div className="border-t border-gray-100 pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-kc-rose-gold" />
            <h3 className="text-sm font-bold text-kc-charcoal uppercase tracking-wider">
              Fecha y Horario de Entrega en Agenda
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* FECHA */}
            <div className="space-y-1.5">
              <Label htmlFor="checkout-fecha" className="text-xs font-semibold text-kc-charcoal">
                Fecha de entrega / recojo *
              </Label>
              <input
                id="checkout-fecha"
                type="date"
                min={manana}
                required
                value={checkout.deliveryDate || manana}
                onChange={handleDateChange}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-sm text-kc-charcoal shadow-sm focus:border-kc-rose-gold focus:outline-none"
              />
              <p className="text-[11px] text-kc-mocha">
                Recomendamos mínimo 24 a 48 hrs de anticipación.
              </p>
            </div>

            {/* HORARIO / TURNO */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-kc-charcoal">
                Turno preferido *
              </Label>
              <Select
                value={checkout.deliveryTime || "11:00 - 13:00"}
                onValueChange={handleTimeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un turno" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="09:00 - 11:00">
                    Mañana temprano (09:00 AM - 11:00 AM)
                  </SelectItem>
                  <SelectItem value="11:00 - 13:00">
                    Mediodía (11:00 AM - 01:00 PM)
                  </SelectItem>
                  <SelectItem value="14:00 - 16:00">
                    Tarde (02:00 PM - 04:00 PM)
                  </SelectItem>
                  <SelectItem value="16:00 - 18:00">
                    Tarde / Noche (04:00 PM - 06:00 PM)
                  </SelectItem>
                  <SelectItem value="18:00 - 20:00">
                    Noche (06:00 PM - 08:00 PM)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-kc-mocha">
                Horario para coordinar el horneado y despacho.
              </p>
            </div>

          </div>

          <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800">
            <Info className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Esta fecha y hora se reservan de forma inmediata en nuestra <strong>Agenda de Producción</strong> al confirmar tu pago.
            </span>
          </div>

        </div>

      </div>
    </Card>
  );
}
