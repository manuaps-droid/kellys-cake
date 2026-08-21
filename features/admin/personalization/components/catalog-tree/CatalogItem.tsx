"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { deleteCatalogAction } from "../../actions/delete-catalog.action";

type Props = {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
};

export default function CatalogItem({
  id,
  nombre,
  orden,
  activo,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm(
      `¿Eliminar "${nombre}"?`
    );

    if (!ok) {
      return;
    }

    const result =
      await deleteCatalogAction(id);

    if (!result.success) {
      alert(result.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-kc-sand/50 bg-kc-cream/30 px-5 py-3 transition hover:bg-kc-cream/60">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-kc-sand text-xs font-medium text-kc-mocha">
          {orden}
        </span>
        <span className="text-sm font-medium text-kc-charcoal">
          {nombre}
        </span>
        {!activo && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-kc-mocha">
            Inactivo
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/catalogos/${id}`}
          className="rounded-lg border border-kc-rose-gold px-3 py-1.5 text-xs font-medium text-kc-rose-gold transition hover:bg-kc-cream"
        >
          Ver
        </Link>

        <Link
          href={`/admin/catalogos/${id}`}
          className="rounded-lg border border-kc-sand px-3 py-1.5 text-xs font-medium text-kc-mocha transition hover:bg-kc-sand/50"
        >
          Editar
        </Link>

        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
