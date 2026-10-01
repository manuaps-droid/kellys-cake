import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

const CATEGORIAS = [
  { tipo: "categoria_producto", nombre: "Tortas", descripcion: "Pasteles y tortas personalizadas", orden: 1 },
  { tipo: "categoria_producto", nombre: "Kekes", descripcion: "Kekes caseros y decorados", orden: 2 },
  { tipo: "categoria_producto", nombre: "Cheesecakes", descripcion: "Cheesecakes clásicos y especiales", orden: 3 },
  { tipo: "categoria_producto", nombre: "Macarrones", descripcion: "Macarons franceses artesanales", orden: 4 },
  { tipo: "categoria_producto", nombre: "Monster cookies", descripcion: "Galletas Monster cookies gigantes", orden: 5 },
  { tipo: "categoria_producto", nombre: "Donas", descripcion: "Donas glaseadas y rellenas", orden: 6 },
];

export async function POST() {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("catalogo_personalizacion")
      .upsert(CATEGORIAS, { onConflict: "tipo,nombre", ignoreDuplicates: true })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ created: data });
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("catalogo_personalizacion")
      .delete()
      .eq("tipo", "categoria_producto")
      .in("nombre", CATEGORIAS.map((c) => c.nombre))
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: data });
  } catch (e) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
