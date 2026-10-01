import Image from "next/image";

import Section from "@/components/shared/Section";
import SectionHeader from "@/components/shared/SectionHeader";

const gallery = [
  {
    image: "/images/gallery/mario-cake.jpg",
    title: "Mario Bros",
  },
  {
    image: "/images/gallery/wedding-cake.jpg",
    title: "Matrimonio",
  },
  {
    image: "/images/gallery/corona-cake.jpg",
    title: "Corona",
  },
  {
    image: "/images/gallery/cumple21.jpg",
    title: "Cumpleaños 21",
  },
  {
    image: "/images/gallery/cumple23.png",
    title: "Cumpleaños 23",
  },
  {
    image: "/images/gallery/cumple7.jpg",
    title: "Cumpleaños 7",
  },
];

export default function GallerySection() {
  return (
    <Section>
      <SectionHeader
        title="Algunas ideas que hemos hecho realidad"
        subtitle="Una muestra chiquita de lo que sale de nuestra cocina. Cada uno fue pensado para una ocasión distinta."
      />

      <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <article
            key={item.title}
            className="group overflow-hidden rounded-[32px] bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}