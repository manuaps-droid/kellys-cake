"use client";

import Image from "next/image";

type Props = {
  url: string;
  alt: string;
};

export default function MediaPreview({
  url,
  alt,
}: Props) {
  return (
    <div className="relative aspect-square">
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
      />
    </div>
  );
}