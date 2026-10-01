import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
      website, // Honeypot para atrapar bots automáticos
    } = body;

    // Si un bot rellena el campo trampa oculto (honeypot), simular éxito silenciosamente
    if (website) {
      return NextResponse.json({ success: true });
    }

    if (
      !nombre?.trim() ||
      !email?.trim() ||
      !asunto?.trim() ||
      !mensaje?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Todos los campos obligatorios deben estar llenos.",
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Formato de correo electrónico no válido.",
        },
        { status: 400 }
      );
    }

    // Validar límites de longitud para prevenir buffer overflow o DoS de base de datos
    if (nombre.trim().length > 100 || email.trim().length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "El nombre o correo exceden la longitud permitida.",
        },
        { status: 400 }
      );
    }

    if (asunto.trim().length > 200 || mensaje.trim().length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "El asunto o mensaje superan el límite de caracteres.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from("contactos").insert({
      nombre: nombre.trim().slice(0, 100),
      email: email.trim().slice(0, 100),
      telefono: telefono?.trim()?.slice(0, 20) || null,
      asunto: asunto.trim().slice(0, 200),
      mensaje: mensaje.trim().slice(0, 2000),
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error en contacto API:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudo enviar el mensaje. Intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}
