import Image from "next/image";

import { getCateringGalleryRepository } from "../repositories/get-catering-gallery.repository";

const FALLBACK_ITEMS = [
  "Mesas dulces",
  "Pasteles corporativos",
  "Cupcakes temáticos",
  "Cake pops",
  "Postres individuales",
  "Galletas decoradas",
];

const FALLBACK_EMOJIS = ["🎂", "🍰", "🧁", "🍭", "🍫", "🍪"];

export default async function CateringGallery() {
  let items = await getCateringGalleryRepository();

  if (items.length === 0) {
    items = FALLBACK_ITEMS.map((label, i) => ({
      id: `fallback-${i}`,
      url: "",
      label,
    }));
  }

  return (
    <section className="bg-kc-ivory py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-kec-rose-gold">
            Inspiración
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl font-bold text-kec-charcoal">
            Nuestras creaciones
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const hasImage = item.url && item.url.length > 0;
            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-kc-rose-gold/10 to-kc-blush/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl ${
                  i === 0 ? "sm:col-span-2 sm:row-span-2 aspect-square" : "aspect-[4/3]"
                }`}
              >
                {hasImage ? (
                  <Image
                    src={item.url}
                    alt={item.label ?? "Creación Kelly's Cake"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute right-6 top-6 text-4xl opacity-30 transition-all duration-500 group-hover:scale-125 group-hover:opacity-50">
                    {FALLBACK_EMOJIS[i % FALLBACK_EMOJIS.length]}
                  </div>
                )}

                <div className="absolute inset-0 flex items-end p-6">
                  <div className="rounded-xl bg-white/80 backdrop-blur-sm px-4 py-2 shadow-sm">
                    <p className="text-sm font-semibold text-kc-charcoal">
                      {item.label || FALLBACK_ITEMS[i % FALLBACK_ITEMS.length]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
