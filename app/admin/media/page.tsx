import PageHeader from "@/components/common/PageHeader";

import MediaGalleryManager from "@/features/media/components/MediaGalleryManager";
import { getMedia } from "@/features/media/services/media.service";

export default async function MediaPage() {
  const media = await getMedia();

  return (
    <>
      <PageHeader
        title="Biblioteca Multimedia"
        description="Sube y administra todas las imágenes del sitio."
      />

      <MediaGalleryManager initialMedia={media} />
    </>
  );
}