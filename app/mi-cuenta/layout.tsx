import Navbar from "@/components/layout/Navbar";
import { getCurrentClient } from "@/features/auth/services/auth.server";
import SidebarNav from "./components/SidebarNav";

export default async function MiCuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getCurrentClient() redirige automáticamente a /auth/login si no hay sesión
  await getCurrentClient();

  return (
    <div className="min-h-screen bg-kc-ivory flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 lg:pt-8 lg:pb-12">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Sidebar Area */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <SidebarNav />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}
