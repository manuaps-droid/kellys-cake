import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

import { getCurrentAdmin } from "@/lib/auth/getCurrentAdmin";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: "Kelly's Cake Admin",
  description:
    "Panel de administración de Kelly's Cake: pedidos, agenda de producción, clientes y configuración.",
  manifest: "/admin/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-admin-192.png",
    apple: "/icons/icon-admin-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "KC Admin",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2C1810",
};

export default async function AdminLayout({
  children,
}: Props) {
  await getCurrentAdmin();

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}