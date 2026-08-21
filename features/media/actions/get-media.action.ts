"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMediaAction() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return [];
  }

  return data;
}