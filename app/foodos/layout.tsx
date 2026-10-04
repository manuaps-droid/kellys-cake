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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Navigation & Bottom Operational Bar */}
      <FoodOSMobileNav tieneLogistica={tieneLogistica} tieneVentas={tieneVentas} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-white flex-shrink-0 flex-col justify-between">
        <div>
          <div className="p-6">
            <h2 className="text-2xl font-black text-blue-400 tracking-tighter">FoodOS<span className="text-white">.AI</span></h2>
            <p className="text-xs text-slate-400 mt-1">Sistema Operativo Gastronómico</p>
          </div>

          <nav className="mt-2 flex flex-col gap-1 px-4 text-sm">
            {/* SECCIÓN CORE (SIEMPRE ACTIVA) */}
            <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pt-2 pb-1">MÓDULO 1: CORE</div>
            <Link href="/foodos" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">📊 Dashboard</Link>
            <Link href="/foodos/ingredientes" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">🥑 Ingredientes</Link>
            <Link href="/foodos/productos" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">🍰 Productos & Recetas</Link>
            <Link href="/foodos/compras/escanear" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-emerald-400 flex items-center justify-between font-medium"><span>📷 Escanear Factura</span> <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">IA</span></Link>
            <Link href="/foodos/compras/nueva" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-slate-300">🛒 Ingresar Compra</Link>
            <Link href="/foodos/eventos" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-yellow-300 font-medium">💰 Eventos & Rentabilidad</Link>
            <Link href="/foodos/copilot" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors border border-blue-500/30 text-blue-300 flex items-center justify-between text-xs"><span>✨ AI Copilot</span> <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">BETA</span></Link>

            {/* SECCIÓN LOGÍSTICA & ALMACENES */}
            <div className="text-[10px] font-bold text-amber-500/80 uppercase px-3 pt-4 pb-1 flex items-center justify-between">
              <span>MÓDULO 2: LOGÍSTICA</span>
              {!tieneLogistica && <span>🔒</span>}
            </div>
            {tieneLogistica ? (
              <>
                <Link href="/foodos/inventario" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-amber-300">📦 Inventario & Stock</Link>
                <Link href="/foodos/produccion/nueva" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">👨‍🍳 Hoja Producción</Link>
              </>
            ) : (
              <Link href="/foodos/modulos" className="px-3 py-2 rounded-md bg-slate-800/40 text-slate-500 hover:text-slate-300 flex items-center justify-between text-xs italic">
                <span>📦 Inventario Bloqueado</span>
                <span>Activar</span>
              </Link>
            )}

            {/* SECCIÓN VENTAS & FACTURACIÓN */}
            <div className="text-[10px] font-bold text-rose-400/80 uppercase px-3 pt-4 pb-1 flex items-center justify-between">
              <span>MÓDULO 3: VENTAS & SUNAT</span>
              {!tieneVentas && <span>🔒</span>}
            </div>
            {tieneVentas ? (
              <>
                <Link href="/foodos/ventas" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-rose-300 font-bold flex items-center justify-between">
                  <span>🧾 Punto de Venta (POS)</span>
                  <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">SUNAT</span>
                </Link>
                <Link href="/foodos/cotizador/nueva" className="px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">📝 Cotizador Catering</Link>
              </>
            ) : (
              <Link href="/foodos/modulos" className="px-3 py-2 rounded-md bg-slate-800/40 text-slate-500 hover:text-slate-300 flex items-center justify-between text-xs italic">
                <span>🧾 Facturación Bloqueada</span>
                <span>Activar</span>
              </Link>
            )}
          </nav>
        </div>

        {/* PIE DEL SIDEBAR: GESTIÓN DE MÓDULOS */}
        <div className="p-4 border-t border-slate-800">
          <Link href="/foodos/modulos" className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 px-3 rounded-lg transition-colors border border-slate-700">
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
