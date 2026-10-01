import PageHeader from "@/components/common/PageHeader";

import MediaGalleryManager from "@/features/media/components/MediaGalleryManager";
import { getMedia } from "@/features/media/services/media.service";

export default async function MediaPage() {
  const media = await getMedia();

  return (
    <>
      <PageHeader
        title="Biblioteca Multimedia"
        description="Imágenes disponibles que aún no han sido asociadas a ningún producto. Las que ya pertenecen a un producto no se muestran aquí."
      />

      <MediaGalleryManager initialMedia={media} />
    </>
  );
}