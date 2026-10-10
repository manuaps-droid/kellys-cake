"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type UploadServicioResult = {
  success: boolean;
  message?: string;
  url?: string;
  fileName?: string;
  size?: number;
};

export async function uploadServicioFileAction(
  formData: FormData
): Promise<UploadServicioResult> {
  try {
    // Solo usuarios autenticados pueden subir archivos
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return { success: false, message: "Inicia sesión para subir archivos." };
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { success: false, message: "No se proporcionó ningún archivo válido." };
    }

    // Límite de 20 MB para documentos y diseños
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, message: "El archivo supera el límite de 20 MB." };
    }

    const originalName = file.name;
    const extension = originalName.includes(".")
      ? originalName.split(".").pop()?.toLowerCase() ?? "bin"
      : "bin";

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
      "png",
      "jpg",
      "jpeg",
      "webp",
      "stl",
      "svg",
    ];

    if (!allowedExtensions.includes(extension)) {
      return {
        success: false,
        message: "Formato no soportado. Formatos válidos: PDF, Word (.docx, .doc), imágenes (PNG, JPG, WebP), SVG o STL.",
      };
    }

    const admin = createAdminClient();
    const safeUUID = randomUUID();
    const sanitizedFileName = `${safeUUID}.${extension}`;
    const storagePath = `servicios/${sanitizedFileName}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Intentar subir al bucket 'personalizacion' o 'productos'
    let bucket = "personalizacion";
    let uploadRes = await admin.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadRes.error) {
      // Fallback al bucket 'productos' si personalizacion falla
      bucket = "productos";
      uploadRes = await admin.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
    }

    if (uploadRes.error) {
      console.error("Error subiendo archivo a Supabase Storage:", uploadRes.error);
      return {
        success: false,
        message: "No se pudo subir el archivo. Intenta nuevamente o contáctanos.",
      };
    }

    const { data: publicUrlData } = admin.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
      fileName: originalName,
      size: file.size,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al subir archivo.";
    return { success: false, message };
  }
}
