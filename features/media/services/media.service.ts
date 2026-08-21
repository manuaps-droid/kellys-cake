import {
  uploadMediaRepository,
} from "../repositories/media.repository";

import { createClient } from "@/lib/supabase/server";

import type { Media } from "../types/media.type";

export async function getMedia() {
  const supabase = await createClient();

  const { data, error } =
    await supabase
      .from("media")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data as Media[];
}

export async function uploadMediaService(
  file: File
) {
  return uploadMediaRepository(file);
}