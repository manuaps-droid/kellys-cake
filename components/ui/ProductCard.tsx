import Image from "next/image";

type ProductCardProps = {
  name: string;
  price: string;
  image: string;
};

export default function ProductCard({
  name,
  price,
  image,
}: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <Image
        src={image}
        alt={name}
        width={600}
        height={400}
        className="h-72 w-full object-cover"
      />

      <div className="p-6">
        <h3 className="text-2xl font-semibold text-[#0B1423]">
          {name}
        </h3>

        <p className="mt-2 text-lg font-medium text-[#D8B07A]">
          {price}
        </p>

        <button className="mt-6 w-full rounded-full bg-[#0B1423] py-3 font-semibold text-white transition hover:bg-[#1b2940]">
          Ver detalles
        </button>
      </div>
    </div>
  );
}