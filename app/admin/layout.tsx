import type { ReactNode } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

import { getCurrentAdmin } from "@/lib/auth/getCurrentAdmin";

type Props = {
  children: ReactNode;
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