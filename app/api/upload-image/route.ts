import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Archivo inválido.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      createAdminClient();

    const extension =
      file.name.split(".").pop();

    const fileName =
      `${randomUUID()}.${extension}`;

    const filePath =
      `proyectos/${fileName}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("personalizacion")
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: publicUrl,
    } = supabase.storage
      .from("personalizacion")
      .getPublicUrl(filePath);

    const {
      data: media,
      error: mediaError,
    } = await supabase
      .from("media")
      .insert({
        nombre: file.name,
        archivo: fileName,
        url: publicUrl.publicUrl,
        bucket:
          "personalizacion",
        carpeta:
          "proyectos",
        mime_type:
          file.type,
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
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error interno",
      },
      {
        status: 500,
      }
    );
  }
}
