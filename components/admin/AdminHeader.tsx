import Link from "next/link";

import { getCurrentAdmin } from "@/lib/auth/getCurrentAdmin";
import ExportButton from "./ExportButton";

export default async function AdminHeader() {
  const admin =
    await getCurrentAdmin();

  return (
    <header className="flex items-center justify-between gap-3 border-b bg-white px-4 py-4 sm:px-8 sm:py-6">
      <div>
        <h2 className="text-xl font-bold text-cake-espresso sm:text-2xl">
          Administración
        </h2>

        <p className="hidden text-sm text-gray-500 sm:block">
          Kelly&apos;s Cake CMS
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden text-right sm:block">
          <p className="font-semibold">
            {admin.cliente.nombre}
          </p>

          <p className="text-sm text-gray-500">
            {admin.cliente.correo}
          </p>
        </div>

        <ExportButton />

        <Link
          href="/"
          className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium transition hover:bg-gray-100 sm:px-4 sm:text-sm"
        >
          Ver tienda
        </Link>
      </div>
    </header>
  );
}