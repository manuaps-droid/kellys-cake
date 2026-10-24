import Link from "next/link";
import { getModulosActivos } from "@/lib/foodos/modules";
import FoodOSMobileNav from "@/components/foodos/FoodOSMobileNav";
import { getCurrentAdmin } from "@/lib/auth/getCurrentAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await getCurrentAdmin();
  const modulos = await getModulosActivos();
  const tieneLogistica = modulos.includes("logistica");
  const tieneVentas = modulos.includes("ventas");

  return (
    <div className="min-h-screen bg-kc-ivory font-poppins text-kc-charcoal flex flex-col md:flex-row">
      {/* Mobile Top Navigation & Bottom Operational Bar */}
      <FoodOSMobileNav tieneLogistica={tieneLogistica} tieneVentas={tieneVentas} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-gradient-to-b from-kc-charcoal to-kc-deep text-kc-cream flex-shrink-0 flex-col justify-between">
        <div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-kc-rose-gold tracking-tight">FoodOS<span className="text-kc-blush">.AI</span></h2>
            <p className="text-xs text-kc-cream/50 mt-1">Sistema Operativo Gastronómico</p>
          </div>

            <nav className="mt-2 flex flex-col gap-1 px-4 text-sm">
            {/* SECCIÓN CORE (SIEMPRE ACTIVA) */}
            <div className="text-[10px] font-bold text-kc-gold/70 uppercase tracking-widest px-3 pt-2 pb-1">Módulo 1: Core</div>
            <Link href="/foodos" className="px-3 py-2 rounded-xl text-kc-cream/75 hover:text-kc-cream hover:bg-white/10 transition-colors">📊 Dashboard</Link>
            <Link href="/foodos/pulso" className="px-3 py-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-white/10 transition-colors font-medium flex items-center justify-between"><span>❤️ Pulso del Negocio</span> <span className="bg-rose-500/90 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">NUEVO</span></Link>
            <Link href="/foodos/ingredientes" className="px-3 py-2 rounded-xl text-kc-cream/75 hover:text-kc-cream hover:bg-white/10 transition-colors">🥑 Ingredientes</Link>
            <Link href="/foodos/productos" className="px-3 py-2 rounded-xl text-kc-cream/75 hover:text-kc-cream hover:bg-white/10 transition-colors">🍰 Productos & Recetas</Link>
            <Link href="/foodos/compras/escanear" className="px-3 py-2 rounded-xl text-emerald-300 hover:text-emerald-200 hover:bg-white/10 transition-colors font-medium flex items-center justify-between"><span>📷 Escanear Factura</span> <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">IA</span></Link>
            <Link href="/foodos/compras/nueva" className="px-3 py-2 rounded-xl text-kc-cream/75 hover:text-kc-cream hover:bg-white/10 transition-colors">🛒 Ingresar Compra</Link>
            <Link href="/foodos/eventos" className="px-3 py-2 rounded-xl text-kc-gold hover:text-kc-blush hover:bg-white/10 transition-colors font-medium">💰 Eventos & Rentabilidad</Link>
            <Link href="/foodos/rentabilidad" className="px-3 py-2 rounded-xl text-emerald-300 hover:text-emerald-200 hover:bg-white/10 transition-colors font-medium flex items-center justify-between"><span>📈 Rentabilidad & Costos</span> <span className="bg-kc-gold text-kc-deep text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">PRO</span></Link>
            <Link href="/foodos/contapro" className="px-3 py-2 rounded-xl text-kc-cream/75 hover:text-kc-cream hover:bg-white/10 transition-colors font-medium flex items-center justify-between"><span>🧮 Importar Contapro</span> <span className="bg-kc-mocha text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">CONTABLE</span></Link>
            <Link href="/foodos/copilot" className="px-3 py-2 rounded-xl text-kc-cream/75 hover:text-kc-cream hover:bg-white/10 border border-kc-blush/25 transition-colors flex items-center justify-between text-xs"><span>✨ AI Copilot</span> <span className="bg-kc-blush/15 text-kc-blush text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">BETA</span></Link>

            {/* SECCIÓN LOGÍSTICA & ALMACENES */}
            <div className="text-[10px] font-bold text-kc-gold/70 uppercase tracking-widest px-3 pt-4 pb-1 flex items-center justify-between">
              <span>Módulo 2: Logística</span>
              {!tieneLogistica && <span>🔒</span>}
            </div>
            {tieneLogistica ? (
              <>
                <Link href="/foodos/inventario" className="px-3 py-2 rounded-xl text-kc-gold hover:text-kc-blush hover:bg-white/10 transition-colors">📦 Inventario & Stock</Link>
                <Link href="/foodos/produccion/nueva" className="px-3 py-2 rounded-xl text-kc-cream/75 hover:text-kc-cream hover:bg-white/10 transition-colors">👨‍🍳 Hoja Producción</Link>
              </>
            ) : (
              <Link href="/foodos/modulos" className="px-3 py-2 rounded-xl bg-white/5 text-kc-cream/40 hover:text-kc-cream/70 flex items-center justify-between text-xs italic">
                <span>📦 Inventario Bloqueado</span>
                <span className="text-kc-rose-gold not-italic">Activar</span>
              </Link>
            )}

            {/* SECCIÓN VENTAS & FACTURACIÓN */}
            <div className="text-[10px] font-bold text-kc-gold/70 uppercase tracking-widest px-3 pt-4 pb-1 flex items-center justify-between">
              <span>Módulo 3: Ventas & SUNAT</span>
              {!tieneVentas && <span>🔒</span>}
            </div>
            {tieneVentas ? (
              <>
                <Link href="/foodos/ventas" className="px-3 py-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-white/10 transition-colors font-bold flex items-center justify-between">
                  <span>🧾 Punto de Venta (POS)</span>
                  <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide">SUNAT</span>
                </Link>
                <Link href="/foodos/cotizador/nueva" className="px-3 py-2 rounded-xl text-kc-cream/75 hover:text-kc-cream hover:bg-white/10 transition-colors">📝 Cotizador Catering</Link>
              </>
            ) : (
              <Link href="/foodos/modulos" className="px-3 py-2 rounded-xl bg-white/5 text-kc-cream/40 hover:text-kc-cream/70 flex items-center justify-between text-xs italic">
                <span>🧾 Facturación Bloqueada</span>
                <span className="text-kc-rose-gold not-italic">Activar</span>
              </Link>
            )}
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
