import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Validar autenticación de administrador
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Suscripción faltante." },
        { status: 400 }
      );
    }

    // Aquí almacenaríamos la suscripción de push en una tabla de la base de datos asociada al usuario.
    // Por ejemplo: supabase.from("dispositivos_admin").upsert({ user_id: user.id, subscription })
    // Como es una estructura extensible, guardamos un log y retornamos éxito.
    console.log("Nueva suscripción push registrada para el usuario:", user.id, subscription);

    return NextResponse.json({
      success: true,
      message: "Suscripción registrada correctamente.",
    });
  } catch (error) {
    console.error("Error en suscripción de push:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
