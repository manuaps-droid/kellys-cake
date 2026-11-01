import { getProductos } from "@/features/productos/queries/get-productos";
import { calcularCosteoReal } from "@/features/rentabilidad/services/costeo-real.service";
import PrediccionDemandaPanel from "@/features/prediccion/components/PrediccionDemandaPanel";

export default async function PrediccionDemandaPage() {
  const productos = await getProductos();

  const productosConCosteo = await Promise.all(
    (productos ?? []).map(async (p) => {
      const d = await calcularCosteoReal(p.id);
      if (!d) return null;
      return {
        id: p.id,
        nombre: p.nombre,
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

  async function handleCalcular(data: {
    producto_ids: string[];
    maquina_id?: string;
    dias_proyectados: number;
  }) {
    // Aquí se podría llamar a una acción de predicción para vending
    console.log("Calcular predicción:", data);
  }

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
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-kc-charcoal">
        Rentabilidad Promedio
      </h1>
      <p className="text-kc-mocha text-sm mt-1">
        Selecciona los productos para calcular su rentabilidad promedio.
      </p>

      <PrediccionDemandaPanel
        productos={productosValidos}
        maquinas={[]}
        onCalcular={handleCalcular}
        calculando={false}
        promedios={{
          margenBrutoPct: promedios.margenBrutoPct,
          costoIngredientes: promedios.costoIngredientes,
          costoEmpaques: promedios.costoEmpaques,
          costoManoObra: promedios.costoManoObra,
          costoIndirectos: promedios.costoIndirectos,
          costoVariable: promedios.costoVariable,
          costoCompleto: promedios.costoCompleto,
          precioVenta: promedios.precioVenta,
        }}
        saludables={saludables}
        alerta={alerta}
        criticos={criticos}
      />
    </div>
  );
}
