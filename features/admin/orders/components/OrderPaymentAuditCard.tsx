import Card from "@/components/ui/Card";
import { CheckCircle2, AlertTriangle, Clock, ShieldCheck, CreditCard } from "lucide-react";

interface Props {
  total: number;
  subtotal: number;
  envio: number;
  metodoPago?: string | null;
  tipoPago?: string | null;
  montoPagado?: number | null;
  estadoPago?: string | null;
  referenciaPago?: string | null;
  webhookPago?: {
    fuente: string;
    status: string;
    external_reference: string;
    payment_id: string | null;
    created_at: string;
  } | null;
}

export default function OrderPaymentAuditCard({
  total,
  subtotal,
  envio,
  metodoPago,
  tipoPago,
  montoPagado,
  estadoPago,
  referenciaPago,
  webhookPago,
}: Props) {
  const isAbono = tipoPago === "abono";
  const expectedAmount = isAbono ? Math.round(total * 0.5 * 100) / 100 : total;
  const pagado = montoPagado ?? 0;
  const diff = Math.abs(pagado - expectedAmount);

  // Determinar estado de conciliación
  let reconciliado = false;
  let conciliacionStatus: "total_ok" | "abono_ok" | "discrepancia" | "pendiente" = "pendiente";

  if (estadoPago === "pagado" || pagado > 0) {
    if (diff <= 0.05) {
      if (isAbono) {
        conciliacionStatus = "abono_ok";
        reconciliado = true;
      } else {
        conciliacionStatus = "total_ok";
        reconciliado = true;
      }
    } else if (pagado > 0 && pagado < expectedAmount) {
      conciliacionStatus = "discrepancia";
    } else if (Math.abs(pagado - total) <= 0.05) {
      conciliacionStatus = "total_ok";
      reconciliado = true;
    } else {
      conciliacionStatus = "discrepancia";
    }
  } else {
    conciliacionStatus = "pendiente";
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-kc-charcoal">
              Auditoría y Conciliación de Pago
            </h2>
            <p className="text-xs text-gray-500">
              Corroboración entre el valor real de los productos y el dinero abonado
            </p>
          </div>
        </div>

        {/* Badge Semáforo de Conciliación */}
        <div>
          {conciliacionStatus === "total_ok" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              PAGO CONCILIADO 100%
            </span>
          )}
          {conciliacionStatus === "abono_ok" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              ABONO 50% VÁLIDO (Saldo al entregar)
            </span>
          )}
          {conciliacionStatus === "discrepancia" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              ALERTA: DISCREPANCIA EN PAGO
            </span>
          )}
          {conciliacionStatus === "pendiente" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
              <Clock className="w-4 h-4 text-gray-500" />
              PAGO PENDIENTE DE CONFIRMAR
            </span>
          )}
        </div>
      </div>

      {/* Grid de conciliación matemática */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">Total Pedido (Catálogo)</p>
          <p className="text-lg font-bold text-gray-900 mt-1">S/ {total.toFixed(2)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Subtotal S/ {subtotal.toFixed(2)} + Envío S/ {envio.toFixed(2)}
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">Modalidad de Pago</p>
          <p className="text-base font-semibold text-gray-900 mt-1 capitalize">
            {isAbono ? "Abono 50%" : "Pago Total (100%)"}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {isAbono ? "Saldo pendiente contra entrega" : "Cancelación completa"}
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-500 uppercase font-medium">Monto Esperado</p>
          <p className="text-lg font-bold text-blue-900 mt-1">S/ {expectedAmount.toFixed(2)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Calculado por el servidor</p>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            reconciliado
              ? "bg-emerald-50/60 border-emerald-200"
              : conciliacionStatus === "discrepancia"
              ? "bg-red-50 border-red-200"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          <p className="text-xs text-gray-500 uppercase font-medium">Monto Realmente Pagado</p>
          <p
            className={`text-lg font-bold mt-1 ${
              reconciliado
                ? "text-emerald-700"
                : conciliacionStatus === "discrepancia"
                ? "text-red-700"
                : "text-gray-900"
            }`}
          >
            S/ {pagado.toFixed(2)}
          </p>
          {isAbono && reconciliado && (
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              Resta cobrar: S/ {(total - pagado).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Alerta de discrepancia si existiera */}
      {conciliacionStatus === "discrepancia" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Atención: El monto recibido no cuadra con el pedido
            </p>
            <p className="text-xs text-red-700 mt-1">
              El cliente o la pasarela reportaron un abono de S/ {pagado.toFixed(2)}, pero los productos
              en el pedido totalizan S/ {expectedAmount.toFixed(2)}. Verifica el comprobante antes de
              entregar.
            </p>
          </div>
        </div>
      )}

      {/* Detalles técnicos de pasarela y auditoría */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-400" />
          <span>Método: <strong className="text-gray-800 capitalize">{metodoPago ?? "No especificado"}</strong></span>
        </div>

        <div>
          <span>Referencia de Pasarela: </span>
          <strong className="font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
            {referenciaPago || "Sin referencia externa"}
          </strong>
        </div>

        <div>
          <span>Estado en Base de Datos: </span>
          <strong className="capitalize text-gray-800">{estadoPago ?? "pendiente"}</strong>
        </div>

        {webhookPago && (
          <div className="w-full bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-center justify-between">
            <span className="text-blue-800">
              Notificación Webhook confirmada por <strong>{webhookPago.fuente}</strong> (Estado:{" "}
              <strong>{webhookPago.status}</strong>)
            </span>
            <span className="text-gray-500 font-mono text-[11px]">
              ID: {webhookPago.payment_id ?? webhookPago.external_reference}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
