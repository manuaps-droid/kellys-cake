"use client";

import { useState } from "react";

type ProductoPrediccionUI = {
  id: string;
  nombre: string;
  precio_costo?: number;
  precio_venta?: number;
  margen_porcentaje?: number;
  seleccionado: boolean;
};

type MaquinaVendingUI = {
  id: string;
  nombre: string;
  ubicacion: string;
  formato: string;
};

type ResultadoPrediccionUI = {
  promedios?: {
    margenBrutoPct: number;
    costoCompleto: number;
    precioVenta: number;
  };
  saludables: number;
  alerta: number;
  criticos: number;
  productos: Array<{
    nombre: string;
    margen: number;
    costoCompleto: number;
    precio: number;
  }>;
};

type PromedioCapas = {
  margenBrutoPct: number;
  costoIngredientes: number;
  costoEmpaques: number;
  costoManoObra: number;
  costoIndirectos: number;
  costoVariable: number;
  costoCompleto: number;
  precioVenta: number;
};

type Props = {
  productos: ProductoPrediccionUI[];
  maquinas: MaquinaVendingUI[];
  onCalcular: (data: {
    producto_ids: string[];
    maquina_id?: string;
    dias_proyectados: number;
  }) => Promise<{
    success: boolean;
    resultado?: ResultadoPrediccionUI;
    error?: string;
  }>;
  calculando: boolean;
  promedios: PromedioCapas;
  saludables: number;
  alerta: number;
  criticos: number;
};

export default function PrediccionDemandaPanel({
  productos,
  maquinas,
  onCalcular,
  calculando,
  promedios,
  saludables,
  alerta,
  criticos,
}: Props) {
  const [productosSeleccionados, setProductosSeleccionados] = useState<string[]>([]);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState<string>("");
  const [diasProyectados, setDiasProyectados] = useState(30);
  const [resultadoCalculo, setResultadoCalculo] = useState<ResultadoPrediccionUI | null>(
    null
  );
  const [errorCalculo, setErrorCalculo] = useState<string | null>(null);

  const toggleProducto = (id: string) => {
    setProductosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCalcular = async () => {
    if (productosSeleccionados.length === 0) return;
    setErrorCalculo(null);
    const res = await onCalcular({
      producto_ids: productosSeleccionados,
      maquina_id: maquinaSeleccionada || undefined,
      dias_proyectados: diasProyectados,
    });
    if (res.success && res.resultado) {
      setResultadoCalculo(res.resultado);
    } else {
      setErrorCalculo(res.error || "Error al calcular.");
    }
  };

  // Vista: resultado del cálculo si existe, sino promedios del catálogo
  const vista = resultadoCalculo
    ? {
        margenBrutoPct: resultadoCalculo.promedios
          ? (resultadoCalculo.productos.reduce(
              (t, p) => t + p.margen,
              0
            ) /
              Math.max(1, resultadoCalculo.productos.length))
        : promedios.margenBrutoPct,
        costoCompleto: resultadoCalculo.promedios
          ? resultadoCalculo.promedios.costoCompleto
          : promedios.costoCompleto,
        precioVenta: resultadoCalculo.promedios
          ? resultadoCalculo.promedios.precioVenta
          : promedios.precioVenta,
        saludables: resultadoCalculo.saludables ?? saludables,
        alerta: resultadoCalculo.alerta ?? alerta,
        criticos: resultadoCalculo.criticos ?? criticos,
        ranking: resultadoCalculo.productos.length > 0
          ? resultadoCalculo.productos.map((p) => ({
              nombre: p.nombre,
              precio: p.precio,
              costoCompleto: p.costoCompleto,
              margen: p.margen,
            }))
          : productos.map((p) => ({
              nombre: p.nombre,
              precio: p.precio_venta || 0,
              costoCompleto: p.precio_costo || 0,
              margen: p.margen_porcentaje || 0,
            })),
      }
    : {
        margenBrutoPct: promedios.margenBrutoPct,
        costoCompleto: promedios.costoCompleto,
        precioVenta: promedios.precioVenta,
        saludables,
        alerta,
        criticos,
        ranking: productos.map((p) => ({
          nombre: p.nombre,
          precio: p.precio_venta || 0,
          costoCompleto: p.precio_costo || 0,
          margen: p.margen_porcentaje || 0,
        })),
      };

  const color =
    vista.margenBrutoPct > 40
      ? "text-emerald-600"
      : vista.margenBrutoPct > 20
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-6">
      {/* Header con botón calcular */}
      <div className="rounded-2xl border border-kc-blush/40 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-kc-mocha">
              Productos para analizar
            </h2>
            <p className="text-xs text-kc-mocha/70 mt-1">
              Selecciona los productos a incluir en el cálculo promedio.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={
                productosSeleccionados.length === productos.length &&
                productos.length > 0
              }
              onChange={() =>
                setProductosSeleccionados(
                  productosSeleccionados.length === productos.length
                    ? []
                    : productos.map((p) => p.id)
                )
              }
              className="w-4 h-4 rounded border-kc-blush"
            />
            <span className="text-sm font-medium text-kc-charcoal">
              Todos ({productosSeleccionados.length}/{productos.length})
            </span>
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {productos.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-3 transition-all ${
                productosSeleccionados.includes(p.id)
                  ? "bg-kc-sand/60 border-kc-rose-gold/50"
                  : "bg-white border-kc-blush/40 hover:border-kc-mocha/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 cursor-pointer min-w-0">
                  <input
                    type="checkbox"
                    checked={productosSeleccionados.includes(p.id)}
                    onChange={() => toggleProducto(p.id)}
                    className="w-4 h-4 rounded border-kc-blush"
                  />
                  <span className="font-medium text-kc-charcoal text-sm truncate">
                    {p.nombre}
                  </span>
                </label>
                <span
                  className={`text-xs font-bold shrink-0 ${
                    (p.margen_porcentaje || 0) > 40
                      ? "text-emerald-700"
                      : (p.margen_porcentaje || 0) > 20
                        ? "text-amber-700"
                        : "text-red-700"
                  }`}
                >
                  {(p.margen_porcentaje || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-kc-mocha">
                <span>Precio:</span>
                <span className="font-bold text-kc-charcoal">
                  S/ {(p.precio_venta || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-kc-mocha">
                <span>Costo:</span>
                <span className="font-bold text-kc-charcoal">
                  S/ {(p.precio_costo || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          {productos.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-kc-blush/60 p-6 text-center text-sm text-kc-mocha">
              No hay productos con receta activa. Crea recetas en Productos & Recetas.
            </div>
          )}
        </div>
      </div>

      {/* Parámetros */}
      <div className="rounded-2xl border border-kc-blush/40 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-widest text-kc-mocha mb-4">
          Parámetros de proyección
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-kc-mocha mb-1">
              Días proyectados
            </label>
            <input
              type="number"
              min={1}
              value={diasProyectados}
              onChange={(e) =>
                setDiasProyectados(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full rounded-lg border border-kc-blush/60 bg-white px-3 py-2 text-sm text-kc-charcoal"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-kc-mocha mb-1">
              Máquina de vending
            </label>
            <select
              value={maquinaSeleccionada}
              onChange={(e) => setMaquinaSeleccionada(e.target.value)}
              className="w-full rounded-lg border border-kc-blush/60 bg-white px-3 py-2 text-sm text-kc-charcoal"
            >
              <option value="">Todas las máquinas</option>
              {maquinas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} ({m.ubicacion})
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCalcular}
          disabled={calculando || productosSeleccionados.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-kc-gold/30 bg-kc-charcoal px-5 py-2.5 text-sm font-bold text-kc-cream shadow-md transition hover:bg-kc-deep disabled:opacity-50"
        >
          📊 {calculando ? "Calculando..." : "Calcular Rentabilidad Promedio"}
        </button>
      </div>

      {/* Resultado */}
      <div className="rounded-2xl border border-kc-blush/40 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-kc-mocha">
            Resultado de Rentabilidad Promedio
          </h2>
          {resultadoCalculo && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Cálculo aplicado a {productosSeleccionados.length} producto(s)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div
            className={`rounded-2xl p-5 text-center shadow-md ${
              vista.margenBrutoPct > 40
                ? "bg-emerald-600"
                : vista.margenBrutoPct > 20
                  ? "bg-amber-500"
                  : "bg-red-600"
            }`}
          >
            <p className="text-[10px] font-bold uppercase text-white/80">
              Margen Promedio
            </p>
            <p className={`text-4xl font-black text-white`}>
              {Math.round(vista.margenBrutoPct * 10) / 10}%
            </p>
          </div>
          <div className="rounded-2xl border border-kc-blush/40 p-5 text-center">
            <p className="text-[10px] font-bold uppercase text-kc-mocha">
              Costo Promedio
            </p>
            <p className="text-2xl font-black text-kc-charcoal">
              S/ {vista.costoCompleto.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-kc-blush/40 p-5 text-center">
            <p className="text-[10px] font-bold uppercase text-kc-mocha">
              Precio Promedio
            </p>
            <p className="text-2xl font-black text-kc-charcoal">
              S/ {vista.precioVenta.toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-kc-blush/40 p-5 text-center">
            <p className="text-[10px] font-bold uppercase text-kc-mocha mb-1">
              Salud del Negocio
            </p>
            <p className="text-xs font-bold">
              <span className="text-emerald-700">✅ {vista.saludables} saludables</span>
              <br />
              <span className="text-amber-700">⚠️ {vista.alerta} en alerta</span>
              <br />
              <span className="text-red-700">🚨 {vista.criticos} críticos</span>
            </p>
          </div>
        </div>

        {/* Ranking */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-kc-mocha mb-2">
            Ranking por Margen (mayor a menor)
          </h3>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {[...vista.ranking]
              .sort((a, b) => b.margen - a.margen)
              .map((p) => (
                <div
                  key={p.nombre}
                  className="flex items-center justify-between rounded-lg bg-kc-sand/50 px-3 py-1.5 text-xs"
                >
                  <span className="truncate font-medium text-kc-charcoal">
                    {p.nombre}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-kc-mocha">
                      S/ {p.precio.toFixed(2)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-bold ${
                        p.margen > 40
                          ? "bg-emerald-100 text-emerald-700"
                          : p.margen > 20
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.margen.toFixed(1)}%
                    </span>
                  </span>
                </div>
              ))}
          </div>
        </div>

        {errorCalculo && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            ⚠️ {errorCalculo}
          </p>
        )}

        <p className="mt-4 text-[10px] text-kc-mocha/70">
          {maquinas.length} máquina(s) vending disponibles · proyección a{" "}
          {diasProyectados} días
        </p>
      </div>
    </div>
  );
}
