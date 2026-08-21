import { createClient } from "@/lib/supabase/server";

import { createImagePath } from "./image-path";

export async function uploadImage(
  userId: string,
  file: File
) {
  const supabase = await createClient();

  const path = createImagePath(
    userId,
    file.name
  );

  const { error } = await supabase.storage
    .from("cake-projects")
    .upload(path, file);

  if (error) {
    throw error;
  }

  return path;
}