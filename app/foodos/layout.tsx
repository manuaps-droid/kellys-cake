import Link from "next/link";
import { getModulosActivos } from "@/lib/foodos/modules";
import { FOODOS_MENU, MENU_BADGE_CLASES, MENU_BADGE_TEXTO } from "@/lib/foodos/menu.config";
import FoodOSMobileNav from "@/components/foodos/FoodOSMobileNav";
import { getCurrentAdmin } from "@/lib/auth/getCurrentAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await getCurrentAdmin();
  const modulos = await getModulosActivos();
  const tieneModulo = (m?: string) => !m || modulos.includes(m);

  return (
    <div className="min-h-screen bg-kc-ivory font-poppins text-kc-charcoal flex flex-col md:flex-row">
      {/* Mobile Top Navigation & Bottom Operational Bar */}
      <FoodOSMobileNav modulosActivos={modulos} />

      {/* Desktop Sidebar — generado desde menu.config.ts */}
      <aside className="hidden md:flex md:w-64 bg-gradient-to-b from-kc-charcoal to-kc-deep text-kc-cream flex-shrink-0 flex-col justify-between">
        <div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-kc-rose-gold tracking-tight">FoodOS<span className="text-kc-blush">.AI</span></h2>
            <p className="text-xs text-kc-cream/50 mt-1">Sistema Operativo Gastronómico</p>
          </div>

          <nav className="mt-2 flex flex-col gap-1 px-4 text-sm">
            {FOODOS_MENU.map((seccion) => {
              const desbloqueada = !seccion.items[0]?.modulo || modulos.includes(seccion.items[0].modulo);
              return (
                <div key={seccion.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between px-3 pt-4 pb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${desbloqueada ? "text-kc-gold/70" : "text-kc-gold/40"}`}>
                      {seccion.titulo}
                    </span>
                    {!desbloqueada && <span>🔒</span>}
                  </div>

                  {seccion.items.map((item) => {
                    const activo = tieneModulo(item.modulo);

                    if (!activo) {
                      return (
                        <Link
                          key={item.href}
                          href="/foodos/modulos"
                          className="px-3 py-2 rounded-xl bg-white/5 text-kc-cream/40 hover:text-kc-cream/70 flex items-center justify-between text-xs italic"
                        >
                          <span>{item.emoji} {item.label} bloqueado</span>
                          <span className="text-kc-rose-gold not-italic">Activar</span>
                        </Link>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="px-3 py-2 rounded-xl text-kc-cream/75 hover:text-kc-cream hover:bg-white/10 transition-colors flex items-center justify-between"
                      >
                        <span>
                          {item.emoji} {item.label}
                        </span>
                        {item.badge && (
                          <span className={`${MENU_BADGE_CLASES[item.badge]} text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide`}>
                            {MENU_BADGE_TEXTO[item.badge]}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* PIE DEL SIDEBAR: GESTIÓN DE MÓDULOS */}
        <div className="p-4 border-t border-white/10">
          <Link href="/foodos/modulos" className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-kc-blush text-xs font-bold py-2.5 px-3 rounded-xl transition-colors border border-kc-gold/25">
            <span>🧩 Gestionar Módulos</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
