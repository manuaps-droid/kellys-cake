import { NextRequest, NextResponse } from "next/server";

import { checkIsAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // Solo administradores en equipos autorizados (máx. 3)
    // pueden registrar notificaciones.
    if (!(await checkIsAdmin())) {
      return NextResponse.json(
        { success: false, message: "No autorizado." },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const subscription = body?.subscription;
    const dispositivoNombre =
      typeof body?.dispositivoNombre === "string"
        ? body.dispositivoNombre.slice(0, 120)
        : null;

    const endpoint = subscription?.endpoint;
    const p256dh = subscription?.keys?.p256dh;
    const auth = subscription?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { success: false, message: "Suscripción inválida." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { error } = await admin
      .from("push_subscriptions")
      .upsert(
        {
          endpoint,
          p256dh,
          auth,
          user_id: user?.id ?? null,
          dispositivo_nombre: dispositivoNombre,
        },
        { onConflict: "endpoint" }
      );

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notificaciones activadas en este equipo.",
    });
  } catch (error) {
    console.error("Error en suscripción de push:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
