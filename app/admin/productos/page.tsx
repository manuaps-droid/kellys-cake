import Link from "next/link";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import SeedCategoriasButton from "@/components/admin/SeedCategoriasButton";

import { getProductsAdminRepository } from "@/features/admin/products/repositories/_admin/get-products.admin.repository";

export default async function AdminProductsPage() {
  const products =
    await getProductsAdminRepository();

  const grouped: Record<
    string,
    typeof products
  > = {};

  for (const p of products) {
    const key =
      p.catalogo_nombre ??
      "Sin catálogo";
    if (!grouped[key])
      grouped[key] = [];
    grouped[key].push(p);
  }

  const sortedKeys = Object.keys(
    grouped
  ).sort((a, b) => {
    if (a === "Sin catálogo")
      return 1;
    if (b === "Sin catálogo")
      return -1;
    return a.localeCompare(b);
  });

  return (
    <section className="space-y-8">
      <PageHeader
        title="Productos"
        description="Administra el catálogo de productos agrupados por categoría."
        actions={
          <div className="flex items-center gap-3">
            <SeedCategoriasButton />
            <Link
              href="/admin/productos/nuevo"
              className="rounded-xl bg-[#0B1423] px-6 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Nuevo producto
            </Link>
          </div>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          title="No existen productos"
          description="Crea tu primer producto para comenzar."
        />
      ) : (
        <div className="space-y-10">
          {sortedKeys.map((key) => (
            <section key={key}>
              <h2 className="mb-4 text-xl font-bold text-[#0B1423]">
                {key}
              </h2>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {grouped[key].map(
                  (product) => (
                    <Link
                      key={
                        product.id
                      }
                      href={`/admin/productos/${product.id}`}
                      className="group rounded-2xl border bg-white p-5 transition hover:shadow-lg"
                    >
                      <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gray-100">
                        {product.imagen_url ? (
                          <img
                            src={product.imagen_url}
                            alt={product.nombre}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-4xl text-gray-300">
                            🍰
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-[#0B1423] group-hover:text-[#D8B07A]">
                        {
                          product.nombre
                        }
                      </h3>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-[#D8B07A]">
                          {product.precio != null
                            ? `S/. ${product.precio.toFixed(2)}`
                            : ""}
                        </span>

                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            product.estado ===
                            "publicado"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {product.estado ===
                          "publicado"
                            ? "Publicado"
                            : "Borrador"}
                        </span>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
