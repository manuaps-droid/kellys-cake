"use client";

import { useState } from "react";
import { registrarVentaPOS } from "../actions/venta-actions";

type Producto = {
  id: string;
  nombre: string;
  precio_venta: number;
};

type ItemCarrito = {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
};

export function PuntoDeVenta({ productos }: { productos: Producto[] }) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipoComprobante, setTipoComprobante] = useState<"boleta" | "factura">("boleta");
  const [tipoDoc, setTipoDoc] = useState("DNI");
  const [numDoc, setNumDoc] = useState("");
  const [nombreCliente, setNombreCliente] = useState("CLIENTE GENERAL");
  const [direccionCliente, setDireccionCliente] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ventaCompletada, setVentaCompletada] = useState<{
    comprobante: string;
    pdf_url: string;
    total: number;
  } | null>(null);
  const [mobileTicketOpen, setMobileTicketOpen] = useState(false);

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (prod: Producto) => {
    setCarrito(prev => {
      const index = prev.findIndex(i => i.producto_id === prod.id);
      if (index >= 0) {
        const updated = [...prev];
        const nuevaCantidad = updated[index].cantidad + 1;
        updated[index] = {
          ...updated[index],
          cantidad: nuevaCantidad,
          precio_total: nuevaCantidad * updated[index].precio_unitario
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            producto_id: prod.id,
            nombre: prod.nombre,
            cantidad: 1,
            precio_unitario: prod.precio_venta || 0,
            precio_total: prod.precio_venta || 0
          }
        ];
      }
    });
  };

  const cambiarCantidad = (index: number, cantidad: number) => {
    if (cantidad <= 0) {
      setCarrito(prev => prev.filter((_, i) => i !== index));
      return;
    }
    setCarrito(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        cantidad: cantidad,
        precio_total: cantidad * updated[index].precio_unitario
      };
      return updated;
    });
  };

  const total = carrito.reduce((sum, item) => sum + item.precio_total, 0);
  const subtotal = Math.round((total / 1.18) * 100) / 100;
  const igv = Math.round((total - subtotal) * 100) / 100;

  const handleCobrar = async () => {
    if (carrito.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await registrarVentaPOS({
      tipo_comprobante: tipoComprobante,
      cliente_tipo_doc: tipoDoc,
      cliente_num_doc: numDoc || undefined,
      cliente_nombre: nombreCliente,
      cliente_direccion: direccionCliente || undefined,
      metodo_pago: metodoPago,
      items: carrito
    });

    if (res.error) {
      setErrorMsg(res.error);
      setIsSubmitting(false);
    } else if (res.success) {
      setVentaCompletada({
        comprobante: res.comprobante!,
        pdf_url: res.pdf_url!,
        total: res.total!
      });
      setCarrito([]);
      setNombreCliente("CLIENTE GENERAL");
      setNumDoc("");
      setDireccionCliente("");
      setIsSubmitting(false);
      setMobileTicketOpen(true);
    }
  };

  const nuevaVenta = () => {
    setVentaCompletada(null);
    setMobileTicketOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-140px)] lg:h-[calc(100vh-130px)]">
      {/* COLUMNA IZQUIERDA: CATÁLOGO DE PRODUCTOS (7 columnas) */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 overflow-hidden">
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Buscar producto en vitrina..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1 sm:pr-2">
          {productosFiltrados.map(prod => (
            <button
              key={prod.id}
              onClick={() => agregarAlCarrito(prod)}
              className="flex flex-col justify-between text-left p-3 rounded-xl border border-gray-200 hover:border-rose-400 hover:bg-rose-50/40 transition-all shadow-xs active:scale-95"
            >
              <div>
                <p className="font-bold text-gray-800 text-sm line-clamp-2">{prod.nombre}</p>
              </div>
              <p className="text-rose-600 font-black text-base mt-2">
                S/ {Number(prod.precio_venta || 0).toFixed(2)}
              </p>
            </button>
          ))}
          {productosFiltrados.length === 0 && (
            <div className="col-span-2 sm:col-span-3 text-center py-12 text-gray-400 text-sm">
              No se encontraron productos en el catálogo.
            </div>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: TICKET / CAJA REGISTRADORA (5 columnas en desktop, modal o sheet en móvil) */}
      <div
        className={`lg:col-span-5 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 justify-between overflow-hidden ${
          mobileTicketOpen
            ? "fixed inset-0 z-50 rounded-none overflow-y-auto sm:inset-4 sm:rounded-2xl shadow-2xl"
            : "hidden lg:flex"
        }`}
      >
        {mobileTicketOpen && !ventaCompletada && (
          <div className="flex items-center justify-between pb-3 mb-2 border-b lg:hidden">
            <span className="font-bold text-gray-800 text-sm">Ticket de Venta</span>
            <button
              type="button"
              onClick={() => setMobileTicketOpen(false)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95"
            >
              <span>← Seguir Agregando</span>
            </button>
          </div>
        )}
        {ventaCompletada ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-black">
              ✓
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">¡Venta Registrada Exitosamente!</h3>
              <p className="text-sm font-bold text-gray-500 mt-1">Comprobante: {ventaCompletada.comprobante}</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">S/ {ventaCompletada.total.toFixed(2)}</p>
            </div>
            <p className="text-xs text-gray-500 max-w-xs">
              El comprobante electrónico ha sido generado y el stock físico de ingredientes se descontó de tu almacén.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-xs pt-4">
              <a
                href={ventaCompletada.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-sm transition-colors text-center"
              >
                📄 Ver / Imprimir Ticket PDF
              </a>
              <button
                onClick={nuevaVenta}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                + Nueva Venta
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TIPO DE COMPROBANTE & DATOS DEL CLIENTE */}
            <div className="space-y-3 pb-3 border-b">
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setTipoComprobante("boleta"); setTipoDoc("DNI"); }}
                  className={`py-2 rounded-lg transition-all ${tipoComprobante === "boleta" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Boleta de Venta
                </button>
                <button
                  type="button"
                  onClick={() => { setTipoComprobante("factura"); setTipoDoc("RUC"); }}
                  className={`py-2 rounded-lg transition-all ${tipoComprobante === "factura" ? "bg-white text-rose-600 shadow-xs" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Factura (RUC)
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Doc</label>
                  <input
                    type="text"
                    placeholder={tipoComprobante === "factura" ? "RUC (11 dígitos)" : "DNI (8 dígitos)"}
                    value={numDoc}
                    onChange={(e) => setNumDoc(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-1.5 mt-0.5"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Cliente / Razón Social</label>
                  <input
                    type="text"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-1.5 mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* LISTA DEL CARRITO */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 my-2 pr-1">
              {carrito.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-gray-800">{item.nombre}</p>
                    <p className="text-gray-400">S/ {item.precio_unitario.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(idx, item.cantidad - 1)}
                      className="w-6 h-6 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="font-black text-gray-900 w-5 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(idx, item.cantidad + 1)}
                      className="w-6 h-6 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                    >
                      +
                    </button>
                    <span className="font-black text-gray-900 w-16 text-right">
                      S/ {item.precio_total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {carrito.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs text-center py-12">
                  Toca los productos del mostrador para agregarlos al ticket.
                </div>
              )}
            </div>

            {/* TOTALES Y MÉTODO DE PAGO */}
            <div className="border-t pt-3 space-y-3">
              <div className="grid grid-cols-4 gap-1 text-[11px] font-bold text-center">
                {["efectivo", "yape", "plin", "tarjeta"].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetodoPago(m)}
                    className={`py-1.5 rounded-lg uppercase border transition-all ${metodoPago === m ? "bg-slate-900 text-white border-slate-900" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 p-3 rounded-xl space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal (Base Imponible 82%):</span>
                  <span className="font-bold text-gray-700">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%):</span>
                  <span className="font-bold text-gray-700">S/ {igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 pt-1 border-t">
                  <span>TOTAL A COBRAR:</span>
                  <span className="text-xl text-rose-600">S/ {total.toFixed(2)}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg font-medium">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="button"
                onClick={handleCobrar}
                disabled={isSubmitting || carrito.length === 0}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-base shadow-lg transition-all"
              >
                {isSubmitting ? "Emitiendo Comprobante..." : `COBRAR S/ ${total.toFixed(2)}`}
              </button>
            </div>
          </>
        )}
      </div>

      {/* BARRA FLOTANTE MÓVIL PARA VER TICKET */}
      {carrito.length > 0 && !mobileTicketOpen && !ventaCompletada && (
        <div className="fixed bottom-16 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 lg:hidden shadow-xl">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div>
              <span className="text-xs text-gray-500 font-medium">
                {carrito.reduce((acc, i) => acc + i.cantidad, 0)} {carrito.reduce((acc, i) => acc + i.cantidad, 0) === 1 ? "ítem" : "ítems"}
              </span>
              <p className="text-lg font-black text-rose-600">S/ {total.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileTicketOpen(true)}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <span>Ver Ticket & Cobrar</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
