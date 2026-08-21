import Card from "@/components/ui/Card";
import StatusBadge from "@/components/common/StatusBadge";

import type { AdminOrderStatus } from "../types/order.type";

type Props = {
  id: string;
  createdAt: string;
  status: AdminOrderStatus;
  observaciones?: string | null;
  metodoPago?: string | null;
  tipoPago?: string | null;
  montoPagado?: number | null;
};

const METODO_LABELS: Record<string, string> = {
  yape: "Yape",
  plin: "Plin",
  transfer: "Transferencia bancaria",
  culqi: "Tarjeta (Culqi)",
  mercadopago: "Mercado Pago",
  cash: "Contra entrega",
};

export default function OrderInfoCard({
  id,
  createdAt,
  status,
  observaciones,
  metodoPago,
  tipoPago,
  montoPagado,
}: Props) {
  return (
    <Card>
      <h2 className="mb-6 text-xl font-semibold">
        Información del pedido
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">
            Código
          </p>

          <p className="font-mono">
            #{id.slice(0, 8)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Fecha
          </p>

          <p>
            {new Date(
              createdAt
            ).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Estado
          </p>

          <StatusBadge
            status={status}
          />
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Método de pago
          </p>

          <p>
            {metodoPago ? METODO_LABELS[metodoPago] ?? metodoPago : "-"}
          </p>
        </div>

        {tipoPago === "abono" && (
          <div className="rounded-lg bg-cake-gold/10 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cake-gold">
              Abono 50%
            </p>
            <p className="mt-1 text-sm">
              Abonado: S/ {(montoPagado ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              Saldo pendiente al entregar
            </p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">
            Observaciones
          </p>

          <p>
            {observaciones ?? "-"}
          </p>
        </div>
      </div>
    </Card>
  );
}