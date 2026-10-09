import { Construction } from "lucide-react";

export default function ConstructionBanner() {
  return (
    <aside
      aria-label="Aviso de mantenimiento"
      className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white shadow-md transition-all"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5 px-4 py-2.5 text-center text-xs font-semibold sm:text-sm tracking-wide">
        <Construction className="h-4 w-4 shrink-0 animate-bounce text-amber-100" />
        <span>
          <strong className="uppercase tracking-wider">Página en construcción:</strong> Estamos realizando mejoras para brindarte una mejor experiencia dulce. Muy pronto disponible.
        </span>
      </div>
    </aside>
  );
}
