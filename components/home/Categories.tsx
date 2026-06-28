import Image from "next/image";
import SectionTitle from "@/components/ui/SectionTitle";

const categories = [
  {
    title: "Cumpleaños",
    image: "/images/categories/birthday.jpg",
  },
  {
    title: "Bodas",
    image: "/images/categories/wedding.jpg",
  },
  {
    title: "Temáticos",
    image: "/images/categories/beer.jpg",
  },
];

export default function Categories() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          title="Explora nuestras categorías"
          subtitle="Encuentra el pastel perfecto para cada ocasión."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <Image
                src={category.image}
                alt={category.title}
                width={600}
                height={400}
                className="h-72 w-full object-cover"
              />

              <div className="p-6">
                <h3 className="text-2xl font-semibold text-[#0B1423]">
                  {category.title}
                </h3>

                <button className="mt-4 font-semibold text-[#D8B07A] hover:underline">
                  Ver colección →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}