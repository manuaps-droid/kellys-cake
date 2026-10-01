import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB máximo

export async function POST(request: Request) {
  try {
    // 1. Validar autenticación
    const userSupabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado. Inicia sesión para subir imágenes.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Archivo inválido.",
        },
        { status: 400 }
      );
    }

    // 2. Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "El archivo supera el límite de 5 MB.",
        },
        { status: 400 }
      );
    }

    // 3. Validar tipo MIME en lista blanca
    const extension = ALLOWED_MIME_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Formato de archivo no permitido. Solo se permiten JPEG, PNG o WebP.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const fileName = `${randomUUID()}.${extension}`;
    const filePath = `proyectos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("personalizacion")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrl } = supabase.storage
      .from("personalizacion")
      .getPublicUrl(filePath);

    // Sanitizar nombre de archivo para evitar caracteres maliciosos
    const safeOriginalName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 100);

    const { data: media, error: mediaError } = await supabase
      .from("media")
      .insert({
        nombre: safeOriginalName,
        archivo: fileName,
        url: publicUrl.publicUrl,
        bucket: "personalizacion",
        carpeta: "proyectos",
        mime_type: file.type,
        size: file.size,
      })
      .select()
      .single();

    if (mediaError) {
      throw mediaError;
    }

    return NextResponse.json({
      success: true,
      media,
    });
  } catch (error) {
    console.error("Error subiendo imagen:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
