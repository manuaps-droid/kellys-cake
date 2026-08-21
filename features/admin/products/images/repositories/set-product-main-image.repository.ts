import { createClient } from "@/lib/supabase/server";

export async function setProductMainImageRepository(
  productId: string,
  imageId: string,
  mediaId: string
) {
  const supabase = await createClient();

  const { error: resetError } = await supabase
    .from("producto_imagenes")
    .update({
      principal: false,
    })
    .eq("producto_id", productId);

  if (resetError) throw resetError;

  const { error: mainError } = await supabase
    .from("producto_imagenes")
    .update({
      principal: true,
    })
    .eq("id", imageId);

  if (mainError) throw mainError;

  const { error: productError } = await supabase
    .from("productos")
    .update({
      imagen_principal_id: mediaId,
    })
    .eq("id", productId);

  if (productError) throw productError;
}