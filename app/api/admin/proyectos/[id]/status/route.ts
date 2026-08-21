import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

import type { AdminProjectStatus } from "@/features/admin/projects/types/project.type";

const ALLOWED_STATUSES: AdminProjectStatus[] = [
  "pendiente",
  "cotizacion_enviada",
  "aprobado",
  "entregado",
  "anulado",
  "finalizado",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { status } = body as { status?: string };

    if (!status || !ALLOWED_STATUSES.includes(status as AdminProjectStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Estado inválido.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("proyectos_personalizados")
      .update({ estado: status })
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado.",
      },
      { status: 500 }
    );
  }
}
