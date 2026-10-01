"use server";

import { revalidatePath } from "next/cache";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export type VentaFormInput = {
  tipo_comprobante: "boleta" | "factura";
  cliente_tipo_doc: string;
  cliente_num_doc?: string;
  cliente_nombre: string;
  cliente_direccion?: string;
  metodo_pago: string;
  items: Array<{
    producto_id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    precio_total: number;
  }>;
};

export async function registrarVentaPOS(data: VentaFormInput) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    if (!data.items || data.items.length === 0) {
      return { error: "Agrega al menos un producto a la venta." };
    }

    const totalVenta = data.items.reduce((sum, i) => sum + i.precio_total, 0);
    const subtotal = Math.round((totalVenta / 1.18) * 100) / 100;
    const igv = Math.round((totalVenta - subtotal) * 100) / 100;

    const serie = data.tipo_comprobante === "factura" ? "F001" : "B001";

    // Obtener correlativo simple
    const { count } = await supabase
      .from('foodos_ventas')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('serie', serie);

    const numeroCorrelativo = String((count || 0) + 1).padStart(6, '0');

    // ========================================================
    // INTEGRACIÓN NUBEFACT (SUNAT)
    // Si NUBEFACT_API_KEY está configurada, enviamos a SUNAT real
    // De lo contrario, se genera respuesta simulada lista
    // ========================================================
    let sunatEstado = "ACEPTADO";
    let pdfUrl = "";
    let codigoQr = "";

    const nubefactToken = process.env.NUBEFACT_TOKEN;
    const nubefactRuta = process.env.NUBEFACT_RUTA;

    if (nubefactToken && nubefactRuta) {
      try {
        const payloadNubefact = {
          operacion: "generar_comprobante",
          tipo_de_comprobante: data.tipo_comprobante === "factura" ? 1 : 2,
          serie: serie,
          numero: Number(numeroCorrelativo),
          sunat_transaction: 1,
          cliente_tipo_de_documento: data.cliente_tipo_doc === "RUC" ? 6 : (data.cliente_tipo_doc === "DNI" ? 1 : "-"),
          cliente_numero_de_documento: data.cliente_num_doc || "00000000",
          cliente_denominacion: data.cliente_nombre,
          cliente_direccion: data.cliente_direccion || "",
          fecha_de_emision: new Date().toISOString().split("T")[0],
          moneda: 1, // Soles
          porcentaje_de_igv: 18.00,
          total_gravada: subtotal,
          total_igv: igv,
          total: totalVenta,
          medio_de_pago: data.metodo_pago,
          items: data.items.map(it => ({
            unidad_de_medida: "NIU",
            codigo: it.producto_id,
            descripcion: it.nombre,
            cantidad: it.cantidad,
            valor_unitario: Math.round((it.precio_unitario / 1.18) * 100) / 100,
            precio_unitario: it.precio_unitario,
            subtotal: Math.round((it.precio_total / 1.18) * 100) / 100,
            tipo_de_igv: 1, // Gravado
            igv: Math.round((it.precio_total - (it.precio_total / 1.18)) * 100) / 100,
            total: it.precio_total
          }))
        };

        const resNubefact = await fetch(nubefactRuta, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${nubefactToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payloadNubefact)
        });

        const jsonNubefact = await resNubefact.json();
        if (jsonNubefact.errors) {
          sunatEstado = "RECHAZADO";
        } else {
          pdfUrl = jsonNubefact.enlace_del_pdf || "";
          codigoQr = jsonNubefact.cadena_para_codigo_qr || "";
        }
      } catch (err) {
        console.error("Error conectando con Nubefact:", err);
      }
    } else {
      // Simulación de comprobante válido para demostración y pruebas
      pdfUrl = `https://demo.nubefact.com/pdf/${serie}-${numeroCorrelativo}.pdf`;
      codigoQr = `${serie}|${numeroCorrelativo}|${totalVenta}|${new Date().toISOString()}`;
    }

    // 1. Guardar Venta
    const { data: nuevaVenta, error: errorVenta } = await supabase
      .from('foodos_ventas')
      .insert({
        tenant_id: tenantId,
        tipo_comprobante: data.tipo_comprobante,
        serie: serie,
        numero: numeroCorrelativo,
        cliente_tipo_doc: data.cliente_tipo_doc,
        cliente_num_doc: data.cliente_num_doc,
        cliente_nombre: data.cliente_nombre,
        cliente_direccion: data.cliente_direccion,
        subtotal: subtotal,
        igv: igv,
        total: totalVenta,
        metodo_pago: data.metodo_pago,
        sunat_enviado: true,
        sunat_estado: sunatEstado,
        enlace_pdf: pdfUrl,
        cadena_para_codigo_qr: codigoQr
      })
      .select().single();

    if (errorVenta || !nuevaVenta) {
      console.error("Error insertando venta:", errorVenta);
      return { error: "No se pudo registrar la venta." };
    }

    // 2. Guardar Items
    const itemsDb = data.items.map(it => ({
      venta_id: nuevaVenta.id,
      producto_id: it.producto_id,
      nombre: it.nombre,
      cantidad: it.cantidad,
      precio_unitario: it.precio_unitario,
      precio_total: it.precio_total
    }));

    await supabase.from('foodos_venta_items').insert(itemsDb);

    // 3. Descuento automático de stock en Kardex
    const { data: almacenPrinc } = await supabase
      .from('foodos_almacenes')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('es_principal', true)
      .maybeSingle();

    if (almacenPrinc) {
      for (const item of data.items) {
        // Buscamos si el producto tiene receta
        const { data: receta } = await supabase
          .from('recetas')
          .select('id')
          .eq('producto_id', item.producto_id)
          .eq('es_activa', true)
          .maybeSingle();

        if (receta) {
          const { data: rItems } = await supabase
            .from('receta_items')
            .select('ingrediente_id, cantidad, unidad')
            .eq('receta_id', receta.id);

          if (rItems) {
            for (const ri of rItems) {
              if (ri.ingrediente_id) {
                // Restar del inventario
                const cantTotalUsada = Number(ri.cantidad) * Number(item.cantidad);
                const { data: invReg } = await supabase
                  .from('foodos_inventario')
                  .select('id, stock_actual')
                  .eq('almacen_id', almacenPrinc.id)
                  .eq('ingrediente_id', ri.ingrediente_id)
                  .maybeSingle();

                if (invReg) {
                  const stockNuevo = Math.max(0, Number(invReg.stock_actual) - cantTotalUsada);
                  await supabase
                    .from('foodos_inventario')
                    .update({ stock_actual: stockNuevo })
                    .eq('id', invReg.id);

                  await supabase.from('foodos_kardex').insert({
                    tenant_id: tenantId,
                    almacen_id: almacenPrinc.id,
                    ingrediente_id: ri.ingrediente_id,
                    tipo_movimiento: 'VENTA',
                    cantidad: -cantTotalUsada,
                    stock_anterior: invReg.stock_actual,
                    stock_posterior: stockNuevo,
                    referencia_documento: `${serie}-${numeroCorrelativo}`
                  });
                }
              }
            }
          }
        }
      }
    }

    revalidatePath('/foodos/ventas');
    revalidatePath('/foodos/inventario');
    revalidatePath('/foodos');

    return {
      success: true,
      comprobante: `${serie}-${numeroCorrelativo}`,
      pdf_url: pdfUrl,
      total: totalVenta
    };
  } catch (error) {
    console.error("Error en registrarVentaPOS:", error);
    return { error: "Error procesando la venta." };
  }
}
