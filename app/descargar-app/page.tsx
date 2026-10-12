import { Suspense } from "react";
import DescargarAppClient from "./DescargarAppClient";

export const metadata = {
  title: "Instalar App del Admin | Kelly's Cake",
  description:
    "Instala el panel de administración de Kelly's Cake como app en tu PC y celulares: abre directo en pedidos, agenda de producción y clientes. La app de la tienda para clientes es opcional.",
};

export default function DescargarAppPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-300">Cargando centro de instalación...</div>}>
      <DescargarAppClient />
    </Suspense>
  );
}
