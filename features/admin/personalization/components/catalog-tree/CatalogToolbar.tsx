import Link from "next/link";

import { Button } from "@/components/ui/Button";

export default function CatalogToolbar() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-kc-charcoal">
          Catálogos de personalización
        </h2>
        <p className="mt-1 text-sm text-kc-mocha">
          Administra sabores, coberturas, celebraciones y más.
        </p>
      </div>

      <Button asChild>
        <Link href="/admin/catalogos/nuevo">
          Nuevo catálogo
        </Link>
      </Button>
    </div>
  );
}
