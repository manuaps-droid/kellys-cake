import { Suspense } from "react";
import DescargarAppClient from "./DescargarAppClient";

export const metadata = {
  title: "Instalar Aplicación Oficial | Kelly's Cake",
  description: "Descarga e instala Kelly's Cake en tu PC y tus celulares Android con actualizaciones automáticas.",
};

export default function DescargarAppPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-300">Cargando centro de instalación...</div>}>
      <DescargarAppClient />
    </Suspense>
  );
}
