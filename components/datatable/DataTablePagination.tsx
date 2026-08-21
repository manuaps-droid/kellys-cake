"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  total: number;
  perPage: number;
  page: number;
  entityLabel?: string;
};

export default function DataTablePagination({
  total,
  perPage,
  page,
  entityLabel = "registros",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(Math.ceil(total / perPage), 1);

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.replace(`${pathname}?${params.toString()}`);
  }

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <p className="text-gray-500">
        Mostrando {from}-{to} de {total} {entityLabel}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-cake-gold hover:text-cake-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>

        <span className="px-2 text-xs font-medium text-gray-600">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-cake-gold hover:text-cake-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
