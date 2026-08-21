import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { presupuesto } = body as {
      presupuesto: number | null;
    };

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("proyectos_personalizados")
      .update({ presupuesto })
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
            : "No se pudo actualizar el presupuesto.",
      },
      { status: 500 }
    );
  }
}
