import { randomUUID } from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadMediaRepository(
  file: File
) {
  const supabase = createAdminClient();

  const extension =
    file.name.split(".").pop();

  const fileName = `${randomUUID()}.${extension}`;

  const filePath = `productos/${fileName}`;

  const bytes = await file.arrayBuffer();

  const buffer = Buffer.from(bytes);

  const { error: uploadError } =
    await supabase.storage
      .from("productos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("productos")
    .getPublicUrl(filePath);

  const { data, error } =
    await supabase
      .from("media")
      .insert({
        nombre: file.name,
        archivo: fileName,
        url: publicUrl,
        bucket: "productos",
        carpeta: "productos",
        mime_type: file.type,
        size: file.size,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}