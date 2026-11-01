import { getProductos } from "@/features/productos/queries/get-productos";
import { calcularCosteoReal } from "@/features/rentabilidad/services/costeo-real.service";
import PrediccionDemandaPanel from "@/features/prediccion/components/PrediccionDemandaPanel";
import { vendingService } from "@/features/vending/services/vending.service";
import type { ResumenMaquina } from "@/features/vending/types/vending.types";

export const metadata = {
  title: "Máquinas Vending | FoodOS",
  description: "Gestión de máquinas expendedoras y su rentabilidad.",
};

export const dynamic = "force-dynamic";

export default async function VentaVendingPage() {
  const productos = await getProductos();

  let maquinas: ResumenMaquina[] = [];
  let errorMaquinas: string | null = null;

  try {
    maquinas = await vendingService.listarMaquinasConResumen();
  } catch (e: any) {
    errorMaquinas = e?.message ?? "No se pudieron cargar las máquinas.";
  }

  const productosConCosteo = await Promise.all(
    (productos ?? []).map(async (p) => {
      const d = await calcularCosteoReal(p.id);
      if (!d) return null;
      return {
        id: p.id,
        nombre: String(p.nombre ?? ""),
        precio_costo: Number(p.precio_costo) || 0,
        precio_venta: Number(p.precio_venta) || 0,
        margen_porcentaje: d.margenBrutoPct,
        seleccionado: false,
      };
    })
  );

  const productosValidos = productosConCosteo.filter(
    (p) => p !== null
  ) as Array<{
    id: string;
    nombre: string;
    precio_costo: number;
    precio_venta: number;
    margen_porcentaje: number;
    seleccionado: boolean;
  }>;

  const margenPromedio =
    productosValidos.length > 0
      ? productosValidos.reduce((t, p) => t + p.margen_porcentaje, 0) /
        productosValidos.length
      : 0;
  const costoCompletoPromedio =
    productosValidos.length > 0
      ? productosValidos.reduce((t, p) => t + p.precio_costo, 0) /
        productosValidos.length
      : 0;
  const precioPromedio =
    productosValidos.length > 0
      ? productosValidos.reduce((t, p) => t + p.precio_venta, 0) /
        productosValidos.length
      : 0;

  const promedios = {
    margenBrutoPct: Math.round(margenPromedio * 10) / 10,
    costoIngredientes: 0,
    costoEmpaques: 0,
    costoManoObra: 0,
    costoIndirectos: 0,
    costoVariable: 0,
    costoCompleto: Math.round(costoCompletoPromedio * 100) / 100,
    precioVenta: Math.round(precioPromedio * 100) / 100,
  };

  const saludables = productosValidos.filter(
    (p) => p.margen_porcentaje > 40
  ).length;
  const alerta = productosValidos.filter(
    (p) => p.margen_porcentaje > 20 && p.margen_porcentaje <= 40
  ).length;
  const criticos = productosValidos.filter(
    (p) => p.margen_porcentaje <= 20
  ).length;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-kc-charcoal">
          Máquinas Vending
        </h1>
        <p className="text-kc-mocha mt-1 text-sm">
          Gestiona tus máquinas expendedoras y proyecta la demanda por
          ubicación.
        </p>
      </div>

      {/* Resumen de máquinas (datos reales de vending_maquinas) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {errorMaquinas ? (
          <div className="col-span-full rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            ⚠️ {errorMaquinas} — ejecuta la migración SQL de vending en Supabase
            para crear las tablas.
          </div>
        ) : maquinas.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-kc-blush/60 bg-white p-6 text-center text-sm text-kc-mocha">
            No hay máquinas registradas todavía. Ejecuta la migración SQL y
            registra tu primera máquina expendedora.
          </div>
        ) : (
          maquinas.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-kc-blush/40 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-kc-charcoal">{m.nombre}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    m.formato === "pantalla_tactil"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {m.formato === "pantalla_tactil" ? "Pantalla" : "Vidrio"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-kc-mocha">{m.ubicacion}</p>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-kc-sand/60 p-2">
                  <p className="text-[9px] font-bold uppercase text-kc-mocha">
                    Vendidos
                  </p>
                  <p className="text-lg font-black text-kc-charcoal">
                    {m.productos_vendidos}
                  </p>
                </div>
                <div className="rounded-lg bg-kc-sand/60 p-2">
                  <p className="text-[9px] font-bold uppercase text-kc-mocha">
                    Ingresos
                  </p>
                  <p className="text-sm font-black text-kc-charcoal">
                    S/ {m.ingresos_totales.toFixed(0)}
                  </p>
                </div>
                <div className="rounded-lg bg-kc-sand/60 p-2">
                  <p className="text-[9px] font-bold uppercase text-kc-mocha">
                    Margen
                  </p>
                  <p
                    className={`text-sm font-black ${
                      m.margen_porcentaje > 40
                        ? "text-emerald-600"
                        : m.margen_porcentaje > 20
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {m.margen_porcentaje.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Proyección de demanda */}
      <PrediccionDemandaPanel
        productos={productosValidos}
        maquinas={maquinas.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          ubicacion: m.ubicacion,
          formato: m.formato,
        }))}
        onCalcular={async () => {
          // La proyección detallada se conectará con calcularPrediccionAction
        }}
        calculando={false}
        promedios={promedios}
        saludables={saludables}
        alerta={alerta}
        criticos={criticos}
      />
    </div>
  );
}
