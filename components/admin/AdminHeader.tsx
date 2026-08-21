import Link from "next/link";

import { getCurrentAdmin } from "@/lib/auth/getCurrentAdmin";
import ExportButton from "./ExportButton";

export default async function AdminHeader() {
  const admin =
    await getCurrentAdmin();

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-6">
      <div>
        <h2 className="text-2xl font-bold text-cake-espresso">
          Administración
        </h2>

        <p className="text-sm text-gray-500">
          Kelly&apos;s Cake CMS
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
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
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
        >
          Ver tienda
        </Link>
      </div>
    </header>
  );
}