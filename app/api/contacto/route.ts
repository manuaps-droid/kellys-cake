import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();
    const {
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
    } = body;

    if (
      !nombre?.trim() ||
      !email?.trim() ||
      !asunto?.trim() ||
      !mensaje?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Todos los campos obligatorios deben estar llenos.",
        },
        { status: 400 }
      );
    }

    const supabase =
      await createClient();

    const { error } =
      await supabase
        .from("contactos")
        .insert({
          nombre: nombre.trim(),
          email: email.trim(),
          telefono:
            telefono?.trim() ||
            null,
          asunto:
            asunto.trim(),
          mensaje:
            mensaje.trim(),
        });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "No se pudo enviar el mensaje. Intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}
